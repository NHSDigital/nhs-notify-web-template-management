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
  $CreateLetterTemplate,
  DatabaseTemplate,
  UserWithOptionalClient,
  User,
} from 'nhs-notify-web-template-management-utils';
import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { LetterUploadRepository } from '../infra/letter-upload-repository';
import { ProofingQueue } from '../infra/proofing-queue';
import { ClientConfigRepository } from '../infra/client-config-repository';

export class TemplateClient {
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
    user: UserWithOptionalClient
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({ template, user });

    const validationResult = await validate($CreateUpdateNonLetter, template);

    if (validationResult.error) {
      log.error('Request failed validation', {
        validationResult,
      });

      return validationResult;
    }

    const clientConfigurationResult = user.clientId
      ? await this.clientConfigRepository.get(user.clientId)
      : { data: null };

    if (clientConfigurationResult.error) {
      log.error('Failed to fetch client configuration', {
        clientConfigurationResult,
      });

      return clientConfigurationResult;
    }

    const createResult = await this.templateRepository.create(
      validationResult.data,
      user.userId,
      user.clientId,
      'NOT_YET_SUBMITTED',
      clientConfigurationResult.data?.campaignId
    );

    if (createResult.error) {
      log.error('Failed to save template to the database', {
        createResult,
      });

      return createResult;
    }

    const templateDTO = this.mapDatabaseObjectToDTO(createResult.data);
    if (!templateDTO) {
      return failure(ErrorCase.INTERNAL, 'Error retrieving template');
    }

    return success(templateDTO);
  }

  async createLetterTemplate(
    template: CreateUpdateTemplate,
    user: UserWithOptionalClient,
    pdf: File,
    csv?: File
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({
      template,
      user,
    });

    const templateValidationResult = await validate(
      $CreateLetterTemplate,
      template
    );

    if (templateValidationResult.error) {
      log.error('Request failed validation', {
        validationResult: templateValidationResult,
      });

      return templateValidationResult;
    }

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

    const withFiles = {
      ...templateValidationResult.data,
      files,
    };

    const clientConfigurationResult = user.clientId
      ? await this.clientConfigRepository.get(user.clientId)
      : { data: null };

    if (clientConfigurationResult.error) {
      log.error('Failed to fetch client configuration', {
        clientConfigurationResult,
      });

      return clientConfigurationResult;
    }

    const createResult = await this.templateRepository.create(
      withFiles,
      user.userId,
      user.clientId,
      'PENDING_UPLOAD',
      clientConfigurationResult.data?.campaignId
    );

    if (createResult.error) {
      log.error('Failed to save template to the database', {
        createResult,
      });

      return createResult;
    }

    const templateDTO = this.mapDatabaseObjectToDTO(createResult.data);

    if (!templateDTO) {
      return failure(ErrorCase.INTERNAL, 'Error retrieving template');
    }

    const uploadResult = await this.letterUploadRepository.upload(
      templateDTO.id,
      user.userId,
      versionId,
      pdf,
      csv
    );

    if (uploadResult.error) {
      log.error('Failed to upload letter files', {
        uploadResult,
      });

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
    user: UserWithOptionalClient,
    expectedStatus: TemplateStatus = 'NOT_YET_SUBMITTED'
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({
      templateId,
      template,
      user,
    });

    const validationResult = await validate($CreateUpdateNonLetter, template);

    if (validationResult.error) {
      log.error('Invalid template', { validationResult });

      return validationResult;
    }

    const updateResult = await this.templateRepository.update(
      templateId,
      validationResult.data,
      user.userId,
      expectedStatus
    );

    if (updateResult.error) {
      log.error('Failed to update template', { updateResult });

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
    user: UserWithOptionalClient
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({ templateId, user });

    const submitResult = await this.templateRepository.submit(
      templateId,
      user.userId
    );

    if (submitResult.error) {
      log.error('Failed to save template to the database', {
        submitResult,
      });

      return submitResult;
    }

    const templateDTO = this.mapDatabaseObjectToDTO(submitResult.data);

    if (!templateDTO) {
      return failure(ErrorCase.INTERNAL, 'Error retrieving template');
    }

    return success(templateDTO);
  }

  async deleteTemplate(
    templateId: string,
    user: UserWithOptionalClient
  ): Promise<Result<void>> {
    const log = this.logger.child({ templateId, user });

    const deleteResult = await this.templateRepository.delete(
      templateId,
      user.userId
    );

    if (deleteResult.error) {
      log.error('Failed to save template to the database', {
        createResult: deleteResult,
      });

      return deleteResult;
    }

    return {
      data: undefined,
    };
  }

  async getTemplate(
    templateId: string,
    user: UserWithOptionalClient
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({
      templateId,
      user,
    });

    const getResult = await this.templateRepository.get(
      templateId,
      user.userId
    );

    if (getResult.error) {
      log.error('Failed to get template', { getResult });

      return getResult;
    }

    const templateDTO = this.mapDatabaseObjectToDTO(getResult.data);
    if (!templateDTO) {
      return failure(ErrorCase.INTERNAL, 'Error retrieving template');
    }

    return success(templateDTO);
  }

  async listTemplates(
    user: UserWithOptionalClient
  ): Promise<Result<TemplateDto[]>> {
    const listResult = await this.templateRepository.list(user.userId);

    if (listResult.error) {
      this.logger.error('Failed to list templates', {
        listResult,
        user,
      });

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

    const clientConfigurationResult = user.clientId
      ? await this.clientConfigRepository.get(user.clientId)
      : { data: null };

    if (clientConfigurationResult.error) {
      log.error('Failed to fetch client configuration', {
        clientConfigurationResult,
      });

      return clientConfigurationResult;
    }

    const clientConfig = clientConfigurationResult.data;

    if (!clientConfig?.features.proofing) {
      log.error({
        code: ErrorCase.FEATURE_DISABLED,
        description: 'UserWithOptionalClient cannot request a proof',
        clientConfig,
      });

      return failure(
        ErrorCase.FEATURE_DISABLED,
        'UserWithOptionalClient cannot request a proof'
      );
    }

    const proofRequestUpdateResult =
      await this.templateRepository.proofRequestUpdate(templateId, user);

    if (proofRequestUpdateResult.error) {
      log
        .child({
          code: proofRequestUpdateResult.error.code,
          description: proofRequestUpdateResult.error.message,
          details: proofRequestUpdateResult.error.details,
        })
        .error(proofRequestUpdateResult.error.actualError);

      return proofRequestUpdateResult;
    }

    const templateDTO = this.mapDatabaseObjectToDTO(
      proofRequestUpdateResult.data
    );

    if (
      !templateDTO ||
      templateDTO.templateType !== 'LETTER' ||
      !templateDTO.personalisationParameters ||
      !templateDTO.campaignId
    ) {
      log.error({
        code: ErrorCase.INTERNAL,
        description: 'Malformed template',
        template: templateDTO,
      });

      return failure(ErrorCase.INTERNAL, 'Malformed template');
    }

    const pdfVersionId = templateDTO.files.pdfTemplate.currentVersion;
    const testDataVersionId = templateDTO.files.testDataCsv?.currentVersion;
    const personalisationParameters = templateDTO.personalisationParameters;
    const letterType = templateDTO.letterType;
    const language = templateDTO.language;
    const name = templateDTO.name;
    const templateCampaignId = templateDTO.campaignId;

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
        .child({
          code: sendQueueResult.error.code,
          description: sendQueueResult.error.message,
          details: sendQueueResult.error.details,
        })
        .error(sendQueueResult.error.actualError);

      return sendQueueResult;
    }

    return success(templateDTO);
  }

  private async updateTemplateStatus(
    templateId: string,
    status: Exclude<TemplateStatus, 'SUBMITTED' | 'DELETED'>,
    user: UserWithOptionalClient
  ): Promise<Result<TemplateDto>> {
    const updateStatusResult = await this.templateRepository.updateStatus(
      templateId,
      user.userId,
      status
    );

    if (updateStatusResult.error) {
      this.logger.error('Failed to save template to the database', {
        createResult: updateStatusResult,
        templateId,
        user,
      });

      return updateStatusResult;
    }

    const templateDTO = this.mapDatabaseObjectToDTO(updateStatusResult.data);

    if (!templateDTO) {
      return failure(ErrorCase.INTERNAL, 'Error retrieving template');
    }

    return success(templateDTO);
  }

  async getClientConfiguration(
    user: UserWithOptionalClient
  ): Promise<Result<ClientConfiguration>> {
    const log = this.logger.child({
      user,
    });

    const clientConfigurationResult = user.clientId
      ? await this.clientConfigRepository.get(user.clientId)
      : { data: null };

    if (clientConfigurationResult.error) {
      log.error('Failed to fetch client configuration', {
        clientConfigurationResult,
      });

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
    const { owner: _1, version: _2, ...templateDTO } = databaseTemplate;

    return isTemplateDtoValid(templateDTO);
  }
}
