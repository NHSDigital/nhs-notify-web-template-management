import type { File } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { failure, success, validate } from '@backend-api/utils/index';
import {
  Result,
  TemplateDto,
  CreateUpdateTemplate,
  ErrorCase,
  PdfLetterFiles,
  $CreateUpdateNonLetter,
  ClientConfiguration,
  $LockNumber,
  $TemplateDto,
  $TemplateFilter,
  PatchTemplate,
  $PatchTemplate,
  AuthoringLetterFiles,
} from 'nhs-notify-backend-client';
import { LETTER_MULTIPART } from 'nhs-notify-backend-client/src/schemas/constants';
import {
  $UploadPdfLetterTemplate,
  $UploadDocxLetterTemplate,
  DatabaseTemplate,
  User,
  $PdfLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { isRightToLeft } from 'nhs-notify-web-template-management-utils/enum';
import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { z } from 'zod/v4';
import { LetterUploadRepository } from '../infra/letter-upload-repository';
import { ProofingQueue } from '../infra/proofing-queue';
import { ClientConfigRepository } from '../infra/client-config-repository';
import { TemplateRepository } from '../infra';
import { TemplateFilter } from 'nhs-notify-backend-client/src/types/filters';
import { RoutingConfigRepository } from '@backend-api/infra/routing-config-repository';

export class TemplateClient {
  private $LetterForProofing = z.intersection(
    $PdfLetterTemplate,
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
    private readonly routingConfigRepository: RoutingConfigRepository,
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
      $UploadPdfLetterTemplate,
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

    const files: PdfLetterFiles = {
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
      'pdf-template',
      csv
    );

    if (uploadResult.error) {
      log
        .child(uploadResult.error.errorMeta)
        .error('Failed to upload letter files', uploadResult.error.actualError);

      return uploadResult;
    }

    const finaliseUploadResult =
      await this.templateRepository.finaliseLetterUpload(templateDTO.id, user);

    if (finaliseUploadResult.error) {
      log
        .child(finaliseUploadResult.error.errorMeta)
        .error(
          'Failed to save template to the database',
          finaliseUploadResult.error.actualError
        );

      return finaliseUploadResult;
    }

    const finalTemplateDTO = this.mapDatabaseObjectToDTO(
      finaliseUploadResult.data
    );

    if (!finalTemplateDTO) {
      return failure(ErrorCase.INTERNAL, 'Error retrieving template');
    }

    return success(finalTemplateDTO);
  }

  async uploadDocxTemplate(
    template: unknown,
    user: User,
    docxTemplate: File
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({
      template,
      user,
    });

    const templateValidationResult = await validate(
      $UploadDocxLetterTemplate,
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

    if (
      docxTemplate.type !== LETTER_MULTIPART.DOCX.fileType ||
      !docxTemplate.name
    ) {
      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Failed to identify or validate DOCX data'
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

    const files: AuthoringLetterFiles = {
      docxTemplate: {
        fileName: docxTemplate.name,
        currentVersion: versionId,
        virusScanStatus: 'PENDING',
      },
    };

    const letterTemplateFields = {
      ...validatedTemplate,
      files,
    };

    const createResult = await this.templateRepository.create(
      letterTemplateFields,
      user,
      'PENDING_VALIDATION',
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
      docxTemplate,
      'docx-template'
    );

    if (uploadResult.error) {
      log
        .child(uploadResult.error.errorMeta)
        .error('Failed to upload letter files', uploadResult.error.actualError);

      return uploadResult;
    }

    return success(templateDTO);
  }

  async updateTemplate(
    templateId: string,
    template: CreateUpdateTemplate,
    user: User,
    lockNumber: number | string
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

    const lockNumberValidation = $LockNumber.safeParse(lockNumber);

    if (!lockNumberValidation.success) {
      log.error(
        'Lock number failed validation',
        z.treeifyError(lockNumberValidation.error)
      );

      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Invalid lock number provided'
      );
    }

    const updateResult = await this.templateRepository.update(
      templateId,
      validationResult.data,
      user,
      'NOT_YET_SUBMITTED',
      lockNumberValidation.data
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

  async patchTemplate(
    templateId: string,
    updates: PatchTemplate,
    user: User,
    lockNumber: number | string
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({
      templateId,
      updates,
      user,
    });

    const validationResult = await validate($PatchTemplate, updates);

    if (validationResult.error) {
      log
        .child(validationResult.error.errorMeta)
        .error('Invalid template updates', validationResult.error.actualError);

      return validationResult;
    }

    const lockNumberValidation = $LockNumber.safeParse(lockNumber);

    if (!lockNumberValidation.success) {
      log.error(
        'Lock number failed validation',
        z.treeifyError(lockNumberValidation.error)
      );

      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Invalid lock number provided'
      );
    }

    if (validationResult.data.campaignId) {
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
        validationResult.data.campaignId
      );

      if (!isCampaignIdValid) {
        log.error('Invalid campaign ID in request');

        return failure(
          ErrorCase.VALIDATION_FAILED,
          'Invalid campaign ID in request'
        );
      }
    }

    const patchResult = await this.templateRepository.patch(
      templateId,
      validationResult.data,
      user,
      lockNumberValidation.data
    );

    if (patchResult.error) {
      log
        .child(patchResult.error.errorMeta)
        .error('Failed to update template', patchResult.error.actualError);

      return patchResult;
    }

    const templateDTO = this.mapDatabaseObjectToDTO(patchResult.data);

    if (!templateDTO) {
      return failure(ErrorCase.INTERNAL, 'Error retrieving template');
    }

    return success(templateDTO);
  }

  async submitTemplate(
    templateId: string,
    user: User,
    lockNumber: number | string
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({ templateId, user });

    const lockNumberValidation = $LockNumber.safeParse(lockNumber);

    if (!lockNumberValidation.success) {
      log.error(
        'Lock number failed validation',
        z.treeifyError(lockNumberValidation.error)
      );

      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Invalid lock number provided'
      );
    }

    const [
      { data: clientConfig, error: clientConfigError },
      { data: template, error: templateError },
    ] = await Promise.all([
      this.getClientConfiguration(user),
      this.getTemplate(templateId, user),
    ]);

    if (clientConfigError) {
      log
        .child(clientConfigError.errorMeta)
        .error(
          'Failed to get client configuration',
          clientConfigError.actualError
        );

      return { error: clientConfigError };
    }

    if (templateError) {
      log
        .child(templateError.errorMeta)
        .error('Failed to get template', templateError.actualError);

      return { error: templateError };
    }

    if (clientConfig.features.routing && template.templateType !== 'LETTER') {
      log
        .child({ templateType: template.templateType })
        .error('Routing is enabled, only letters are permitted');

      return failure(ErrorCase.VALIDATION_FAILED, 'Unexpected non-letter');
    }

    const result = clientConfig.features.routing
      ? await this.templateRepository.approveProof(
          templateId,
          user,
          lockNumberValidation.data
        )
      : await this.templateRepository.submit(
          templateId,
          user,
          lockNumberValidation.data
        );

    if (result.error) {
      log
        .child(result.error.errorMeta)
        .error(
          'Failed to save template to the database',
          result.error.actualError
        );

      return result;
    }

    const templateDTO = this.mapDatabaseObjectToDTO(result.data);

    if (!templateDTO) {
      return failure(ErrorCase.INTERNAL, 'Error retrieving template');
    }

    return success(templateDTO);
  }

  async deleteTemplate(
    templateId: string,
    user: User,
    lockNumber: number | string
  ): Promise<Result<void>> {
    const log = this.logger.child({ templateId, user });

    const lockNumberValidation = $LockNumber.safeParse(lockNumber);

    if (!lockNumberValidation.success) {
      log.error(
        'Lock number failed validation',
        z.treeifyError(lockNumberValidation.error)
      );

      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Invalid lock number provided'
      );
    }

    // Check if template is linked to any routing configs
    const routingConfigsResult =
      await this.routingConfigRepository.getByTemplateId(
        templateId,
        user.clientId
      );

    if (routingConfigsResult.error) {
      log
        .child(routingConfigsResult.error.errorMeta)
        .error(
          'Failed to check routing config links',
          routingConfigsResult.error.actualError
        );

      return routingConfigsResult;
    }

    if (routingConfigsResult.data.length > 0) {
      log
        .child({
          routingConfigs: routingConfigsResult.data,
        })
        .error('Template is linked to routing configs');

      return failure(
        ErrorCase.TEMPLATE_IN_USE,
        'Template is linked to active message plans and cannot be deleted',
        undefined,
        { errorCode: 'TEMPLATE_IN_USE' }
      );
    }

    const deleteResult = await this.templateRepository.delete(
      templateId,
      user,
      lockNumberValidation.data
    );

    if (deleteResult.error) {
      log
        .child(deleteResult.error.errorMeta)
        .error(
          'Failed to delete template in the database',
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

  async listTemplates(
    user: User,
    filters?: unknown
  ): Promise<Result<TemplateDto[]>> {
    let parsedFilters: TemplateFilter = {};

    if (filters) {
      const validation = await validate($TemplateFilter, filters);

      if (validation.error) {
        return validation;
      }

      parsedFilters = validation.data;
    }

    const {
      templateStatus,
      templateType,
      language,
      excludeLanguage,
      letterType,
    } = parsedFilters;
    const query = this.templateRepository.query(user.clientId);
    query.excludeTemplateStatus('DELETED');
    if (templateStatus) query.templateStatus(...templateStatus);
    if (templateType) query.templateType(templateType);
    if (language) query.language(language);
    if (excludeLanguage) query.excludeLanguage(excludeLanguage);
    if (letterType) query.letterType(letterType);

    return query.list();
  }

  async requestProof(
    templateId: string,
    user: User,
    lockNumber: number | string
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({ templateId, user });

    const lockNumberValidation = $LockNumber.safeParse(lockNumber);

    if (!lockNumberValidation.success) {
      log.error(
        'Lock number failed validation',
        z.treeifyError(lockNumberValidation.error)
      );

      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Invalid lock number provided'
      );
    }

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
      await this.templateRepository.proofRequestUpdate(
        templateId,
        user,
        lockNumberValidation.data
      );

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
    const parseResult = $TemplateDto.safeParse(databaseTemplate);
    if (!parseResult.success) {
      this.logger.child(databaseTemplate).error({
        description: 'Failed to parse template',
        err: parseResult.error,
      });
    }
    return parseResult.data;
  }
}
