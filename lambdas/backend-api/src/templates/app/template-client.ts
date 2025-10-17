import type { File } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { failure, success, validate } from '@backend-api/utils/index';
import {
  Result,
  TemplateDto,
  CreateUpdateTemplate,
  ErrorCase,
  isTemplateDtoValid,
  LetterFiles,
  TemplateStatus,
  $CreateUpdateNonLetter,
  ClientConfiguration,
} from 'nhs-notify-backend-client';
import { TemplateRepository } from '@backend-api/templates/infra';
import { LETTER_MULTIPART } from 'nhs-notify-backend-client/src/schemas/constants';
import {
  $UploadLetterTemplate,
  DatabaseTemplate,
  User,
  $LetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { isRightToLeft } from 'nhs-notify-web-template-management-utils/enum';
import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { z } from 'zod/v4';
import { LetterUploadRepository } from '../infra/letter-upload-repository';
import { ProofingQueue } from '../infra/proofing-queue';
import { ClientConfigRepository } from '../infra/client-config-repository';

export class TemplateClient {
  private $LetterForProofing = z.intersection(
    $LetterTemplate,
    z.object({
      templateType: z.literal('LETTER'),
      personalisationParameters: z.array(z.string()),
      campaignId: z.string(),
    })
  );

  constructor(
    private readonly templateRepository: TemplateRepository,
    private readonly letterUploadRepository: LetterUploadRepository,
    private readonly proofingQueue: ProofingQueue,
    private readonly defaultLetterSupplier: string,
    private readonly clientConfigRepository: ClientConfigRepository,
    private readonly logger: Logger
  ) {}

  async createTemplate(
    template: CreateUpdateTemplate,
    user: User
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({ template, user });

    const validationResult = await validate($CreateUpdateNonLetter, template);

    if (validationResult.error) {
      log
        .child(validationResult.error.errorMeta)
        .error('Request failed validation', validationResult.error.actualError);

      return validationResult;
    }

    const createResult = await this.templateRepository.create(
      validationResult.data,
      user,
      'NOT_YET_SUBMITTED'
    );

    if (createResult.error) {
      log
        .child(createResult.error.errorMeta)
        .error(
          'Failed to save template to the database',
          createResult.error.actualError
        );

      return createResult;
    }

    const templateDTO = this.mapDatabaseObjectToDTO(createResult.data);
    if (!templateDTO) {
      return failure(ErrorCase.INTERNAL, 'Error retrieving template');
    }

    return success(templateDTO);
  }

  async uploadLetterTemplate(
    template: unknown,
    user: User,
    pdf: File,
    csv?: File
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({
      template,
      user,
    });

    const templateValidationResult = await validate(
      $UploadLetterTemplate,
      template
    );

    if (templateValidationResult.error) {
      log
        .child(templateValidationResult.error.errorMeta)
        .error(
          'Request failed validation',
          templateValidationResult.error.actualError
        );

      return templateValidationResult;
    }

    const validatedTemplate = templateValidationResult.data;

    if (pdf.type !== LETTER_MULTIPART.PDF.fileType || !pdf.name) {
      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Failed to identify or validate PDF data'
      );
    }

    if (csv && (csv.type !== LETTER_MULTIPART.CSV.fileType || !csv.name)) {
      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Failed to validate CSV data'
      );
    }

    const clientConfigurationResult = await this.clientConfigRepository.get(
      user.clientId
    );

    const { data: clientConfiguration, error: clientConfigurationError } =
      clientConfigurationResult;

    if (clientConfigurationError) {
      log
        .child(clientConfigurationError.errorMeta)
        .error(
          'Failed to fetch client configuration',
          clientConfigurationError.actualError
        );

      return clientConfigurationResult;
    }

    const isCampaignIdValid = this.isCampaignIdValid(
      clientConfiguration,
      validatedTemplate.campaignId
    );

    if (!isCampaignIdValid) {
      log.error('Invalid campaign ID in request');

      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Invalid campaign ID in request'
      );
    }

    const versionId = randomUUID();

    const files: LetterFiles = {
      pdfTemplate: {
        fileName: pdf.name,
        currentVersion: versionId,
        virusScanStatus: 'PENDING',
      },
      ...(csv && {
        testDataCsv: {
          fileName: csv.name,
          currentVersion: versionId,
          virusScanStatus: 'PENDING',
        },
      }),
      proofs: {},
    };

    const proofingEnabled =
      (!isRightToLeft(validatedTemplate.language) &&
        clientConfiguration?.features.proofing) ||
      false;

    const letterTemplateFields = {
      ...validatedTemplate,
      proofingEnabled,
      files,
    };

    const createResult = await this.templateRepository.create(
      letterTemplateFields,
      user,
      'PENDING_UPLOAD',
      validatedTemplate.campaignId
    );

    if (createResult.error) {
      log
        .child(createResult.error.errorMeta)
        .error(
          'Failed to save template to the database',
          createResult.error.actualError
        );

      return createResult;
    }

    const templateDTO = this.mapDatabaseObjectToDTO(createResult.data);

    if (!templateDTO) {
      return failure(ErrorCase.INTERNAL, 'Error retrieving template');
    }

    const uploadResult = await this.letterUploadRepository.upload(
      templateDTO.id,
      user,
      versionId,
      pdf,
      csv
    );

    if (uploadResult.error) {
      log
        .child(uploadResult.error.errorMeta)
        .error('Failed to upload letter files', uploadResult.error.actualError);

      return uploadResult;
    }

    const updateTemplateResult = await this.updateTemplateStatus(
      templateDTO.id,
      'PENDING_VALIDATION',
      user
    );

    if (updateTemplateResult.error) return updateTemplateResult;

    return success(updateTemplateResult.data);
  }

  async updateTemplate(
    templateId: string,
    template: CreateUpdateTemplate,
    user: User,
    expectedStatus: TemplateStatus = 'NOT_YET_SUBMITTED'
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({
      templateId,
      template,
      user,
    });

    const validationResult = await validate($CreateUpdateNonLetter, template);

    if (validationResult.error) {
      log
        .child(validationResult.error.errorMeta)
        .error('Invalid template', validationResult.error.actualError);

      return validationResult;
    }

    const updateResult = await this.templateRepository.update(
      templateId,
      validationResult.data,
      user,
      expectedStatus
    );

    if (updateResult.error) {
      log
        .child(updateResult.error.errorMeta)
        .error('Failed to update template', updateResult.error.actualError);

      return updateResult;
    }

    const templateDTO = this.mapDatabaseObjectToDTO(updateResult.data);

    if (!templateDTO) {
      return failure(ErrorCase.INTERNAL, 'Error retrieving template');
    }

    return success(templateDTO);
  }

  async submitTemplate(
    templateId: string,
    user: User
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({ templateId, user });

    const submitResult = await this.templateRepository.submit(templateId, user);

    if (submitResult.error) {
      log
        .child(submitResult.error.errorMeta)
        .error(
          'Failed to save template to the database',
          submitResult.error.actualError
        );

      return submitResult;
    }

    const templateDTO = this.mapDatabaseObjectToDTO(submitResult.data);

    if (!templateDTO) {
      return failure(ErrorCase.INTERNAL, 'Error retrieving template');
    }

    return success(templateDTO);
  }

  async deleteTemplate(templateId: string, user: User): Promise<Result<void>> {
    const log = this.logger.child({ templateId, user });

    const deleteResult = await this.templateRepository.delete(templateId, user);

    if (deleteResult.error) {
      log
        .child(deleteResult.error.errorMeta)
        .error(
          'Failed to save template to the database',
          deleteResult.error.actualError
        );

      return deleteResult;
    }

    return {
      data: undefined,
    };
  }

  async getTemplate(
    templateId: string,
    user: User
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({
      templateId,
      user,
    });

    const getResult = await this.templateRepository.get(
      templateId,
      user.clientId
    );

    if (getResult.error) {
      log
        .child(getResult.error.errorMeta)
        .error('Failed to get template', getResult.error.actualError);

      return getResult;
    }

    const templateDTO = this.mapDatabaseObjectToDTO(getResult.data);
    if (!templateDTO) {
      return failure(ErrorCase.INTERNAL, 'Error retrieving template');
    }

    return success(templateDTO);
  }

  async listTemplates(user: User): Promise<Result<TemplateDto[]>> {
    const listResult = await this.templateRepository.list(user.clientId);

    if (listResult.error) {
      this.logger
        .child({ ...listResult.error.errorMeta, user })
        .error('Failed to list templates', listResult.error.actualError);

      return listResult;
    }

    const templateDTOs = listResult.data
      .map((template) => this.mapDatabaseObjectToDTO(template))
      .flatMap((t) => t ?? []);

    return success(templateDTOs);
  }

  async requestProof(
    templateId: string,
    user: User
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({ templateId, user });

    const clientConfigurationResult = await this.clientConfigRepository.get(
      user.clientId
    );

    if (clientConfigurationResult.error) {
      log
        .child(clientConfigurationResult.error.errorMeta)
        .error(
          'Failed to fetch client configuration',
          clientConfigurationResult.error.actualError
        );

      return clientConfigurationResult;
    }

    const clientConfig = clientConfigurationResult.data;

    if (!clientConfig?.features.proofing) {
      log.error({
        code: ErrorCase.FEATURE_DISABLED,
        description: 'User cannot request a proof',
        clientConfig,
      });

      return failure(ErrorCase.FEATURE_DISABLED, 'User cannot request a proof');
    }

    const proofRequestUpdateResult =
      await this.templateRepository.proofRequestUpdate(templateId, user);

    if (proofRequestUpdateResult.error) {
      log
        .child(proofRequestUpdateResult.error.errorMeta)
        .error(proofRequestUpdateResult.error.actualError);

      return proofRequestUpdateResult;
    }

    const proofLetterValidationResult = this.$LetterForProofing.safeParse(
      proofRequestUpdateResult.data
    );

    if (proofLetterValidationResult.error) {
      log
        .child({
          code: ErrorCase.INTERNAL,
          template: proofRequestUpdateResult.data,
        })
        .error('Malformed template', proofLetterValidationResult.error);

      return failure(ErrorCase.INTERNAL, 'Malformed template');
    }

    const {
      campaignId: templateCampaignId,
      files,
      language,
      letterType,
      name,
      personalisationParameters,
    } = proofLetterValidationResult.data;

    const pdfVersionId = files.pdfTemplate.currentVersion;
    const testDataVersionId = files.testDataCsv?.currentVersion;

    const sendQueueResult = await this.proofingQueue.send(
      templateId,
      name,
      user,
      templateCampaignId,
      personalisationParameters,
      letterType,
      language,
      pdfVersionId,
      testDataVersionId,
      this.defaultLetterSupplier
    );

    if (sendQueueResult.error) {
      log
        .child(sendQueueResult.error.errorMeta)
        .error(sendQueueResult.error.actualError);

      return sendQueueResult;
    }

    return success(proofLetterValidationResult.data);
  }

  private async updateTemplateStatus(
    templateId: string,
    status: Exclude<TemplateStatus, 'SUBMITTED' | 'DELETED'>,
    user: User
  ): Promise<Result<TemplateDto>> {
    const updateStatusResult = await this.templateRepository.updateStatus(
      templateId,
      user,
      status
    );

    if (updateStatusResult.error) {
      this.logger
        .child({
          templateId,
          user,
          ...updateStatusResult.error.errorMeta,
        })
        .error(
          'Failed to save template to the database',
          updateStatusResult.error.actualError
        );

      return updateStatusResult;
    }

    const templateDTO = this.mapDatabaseObjectToDTO(updateStatusResult.data);

    if (!templateDTO) {
      return failure(ErrorCase.INTERNAL, 'Error retrieving template');
    }

    return success(templateDTO);
  }

  isCampaignIdValid(
    clientConfiguration: ClientConfiguration | null,
    campaignIdFromRequest: string
  ): boolean {
    if (!clientConfiguration) {
      return false;
    }

    const { campaignIds = [] } = clientConfiguration;

    return campaignIds.includes(campaignIdFromRequest);
  }

  async getClientConfiguration(
    user: User
  ): Promise<Result<ClientConfiguration>> {
    const log = this.logger.child({
      user,
    });

    const clientConfigurationResult = await this.clientConfigRepository.get(
      user.clientId
    );

    if (clientConfigurationResult.error) {
      log
        .child(clientConfigurationResult.error.errorMeta)
        .error(
          'Failed to fetch client configuration',
          clientConfigurationResult.error.actualError
        );

      return clientConfigurationResult;
    }

    if (clientConfigurationResult.data === null) {
      return failure(
        ErrorCase.NOT_FOUND,
        'Client configuration is not available'
      );
    }

    return success(clientConfigurationResult.data);
  }

  private mapDatabaseObjectToDTO(
    databaseTemplate: DatabaseTemplate
  ): TemplateDto | undefined {
    return isTemplateDtoValid(databaseTemplate);
  }
}
