import type { File } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { z } from 'zod/v4';
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
  AuthoringLetterPatch,
  $AuthoringLetterPatch,
  LetterVariant,
  LetterType,
} from 'nhs-notify-backend-client';
import type { TemplateFilter } from 'nhs-notify-backend-client/src/types/filters';
import { LETTER_MULTIPART } from 'nhs-notify-backend-client/src/schemas/constants';
import {
  $UploadLetterTemplate,
  DatabaseTemplate,
  User,
  $PdfLetterTemplate,
  AuthoringLetterTemplate,
} from 'nhs-notify-web-template-management-utils';
import { isRightToLeft } from 'nhs-notify-web-template-management-utils/enum';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import type { ProofingQueue } from '../infra/proofing-queue';
import type { ClientConfigRepository } from '../infra/client-config-repository';
import type {
  LetterUploadRepository,
  TemplateRepository,
} from '@backend-api/infra';
import type { RoutingConfigRepository } from '@backend-api/infra/routing-config-repository';
import type {
  LetterVariantQueryFilters,
  LetterVariantRepository,
} from '@backend-api/infra/letter-variant-repository';

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
    private readonly letterVariantRepository: LetterVariantRepository,
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

    const clientConfigurationResult = await this.validateCampaignIdForUser(
      user,
      validatedTemplate.campaignId,
      log
    );

    if (clientConfigurationResult.error) {
      return clientConfigurationResult;
    }

    const { data: clientConfiguration } = clientConfigurationResult;

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
        clientConfiguration.features.proofing) ||
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

    const lockNumberValidation = this.validateLockNumber(lockNumber, log);

    if (lockNumberValidation.error) {
      return lockNumberValidation;
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

  async patchLetterAuthoringTemplate(
    templateId: string,
    updates: AuthoringLetterPatch,
    user: User,
    lockNumber: number | string
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({
      templateId,
      updates,
      user,
    });

    const validationResult = await validate($AuthoringLetterPatch, updates);

    if (validationResult.error) {
      log
        .child(validationResult.error.errorMeta)
        .error('Invalid template updates', validationResult.error.actualError);

      return validationResult;
    }

    const lockNumberValidation = this.validateLockNumber(lockNumber, log);

    if (lockNumberValidation.error) {
      return lockNumberValidation;
    }

    const normalisedPatchResult = await this.normaliseLetterAuthoringPatch(
      templateId,
      validationResult.data,
      user,
      log
    );

    if (normalisedPatchResult.error) {
      return normalisedPatchResult;
    }

    const patch = normalisedPatchResult.data;

    const patchResult = await this.templateRepository.patch(
      templateId,
      patch,
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

    const lockNumberValidation = this.validateLockNumber(lockNumber, log);

    if (lockNumberValidation.error) {
      return lockNumberValidation;
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

    const lockNumberValidation = this.validateLockNumber(lockNumber, log);

    if (lockNumberValidation.error) {
      return lockNumberValidation;
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

    const lockNumberValidation = this.validateLockNumber(lockNumber, log);

    if (lockNumberValidation.error) {
      return lockNumberValidation;
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

  async getLetterVariantsForTemplate(
    templateId: string,
    user: User
  ): Promise<Result<LetterVariant[]>> {
    const templateResult = await this.getTemplateAssertLetterAuthoring(
      templateId,
      user
    );

    if (templateResult.error) {
      return templateResult;
    }

    return this.queryLetterVariantsForAuthoringTemplate(templateResult.data);
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
      this.logger.child(databaseTemplate).error('Failed to parse template');
    }
    return parseResult.data;
  }

  private async queryLetterVariantsForAuthoringTemplate(
    template: AuthoringLetterTemplate
  ) {
    const typeMap: Record<LetterType, LetterVariant['type']> = {
      x0: 'STANDARD',
      x1: 'STANDARD',
      q4: 'STANDARD',
    };

    const filters: LetterVariantQueryFilters = {
      type: typeMap[template.letterType],
      status: 'PROD',
    };

    const queries = [
      this.letterVariantRepository.getGlobalLetterVariants(filters),
      this.letterVariantRepository.getClientScopedLetterVariants(
        template.clientId,
        filters
      ),
    ];

    if (template.campaignId) {
      queries.push(
        this.letterVariantRepository.getCampaignScopedLetterVariants(
          template.clientId,
          template.campaignId,
          filters
        )
      );
    }

    const variants: LetterVariant[] = [];

    for (const queryResult of await Promise.all(queries)) {
      if (queryResult.error) {
        return queryResult;
      }

      variants.push(...queryResult.data);
    }

    return success(variants);
  }

  private async getTemplateAssertLetterAuthoring(
    templateId: string,
    user: User
  ): Promise<Result<AuthoringLetterTemplate>> {
    const templateResult = await this.getTemplate(templateId, user);

    if (templateResult.error) {
      return templateResult;
    }

    const { data: template } = templateResult;

    if (
      template.templateType !== 'LETTER' ||
      template.letterVersion !== 'AUTHORING'
    ) {
      return failure(
        ErrorCase.FEATURE_DISABLED,
        'Unsupported for this template type'
      );
    }

    return success(template);
  }

  private async normaliseLetterAuthoringPatch(
    templateId: string,
    patchInput: AuthoringLetterPatch,
    user: User,
    log: Logger
  ): Promise<Result<AuthoringLetterPatch>> {
    const patch = { ...patchInput };

    if (patch.campaignId) {
      const campaignValidation = await this.validateCampaignIdForUser(
        user,
        patch.campaignId,
        log
      );

      if (campaignValidation.error) {
        return campaignValidation;
      }
    }

    const needsTemplate = Boolean(patch.campaignId || patch.letterVariantId);

    if (!needsTemplate) {
      return success(patch);
    }

    const templateResult = await this.getTemplateAssertLetterAuthoring(
      templateId,
      user
    );

    if (templateResult.error) {
      return templateResult;
    }

    const { data: template } = templateResult;

    const needsVariantValidation =
      Boolean(patch.letterVariantId) ||
      Boolean(patch.campaignId && template.letterVariantId);

    if (!needsVariantValidation) {
      return success(patch);
    }

    const effectiveTemplate: AuthoringLetterTemplate = {
      ...template,
      campaignId: patch.campaignId ?? template.campaignId,
    };

    const variantsResult =
      await this.queryLetterVariantsForAuthoringTemplate(effectiveTemplate);

    if (variantsResult.error) {
      return variantsResult;
    }

    const variantIds = new Set(
      variantsResult.data.map((variant) => variant.id)
    );

    if (patch.letterVariantId && !variantIds.has(patch.letterVariantId)) {
      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Invalid letterVariantId in request'
      );
    }

    if (
      !patch.letterVariantId &&
      patch.campaignId &&
      template.letterVariantId &&
      !variantIds.has(template.letterVariantId)
    ) {
      patch.letterVariantId = '';
    }

    return success(patch);
  }

  private validateLockNumber(
    lockNumber: number | string,
    log: Logger
  ): Result<number> {
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

    return success(lockNumberValidation.data);
  }

  private async validateCampaignIdForUser(
    user: User,
    campaignId: string,
    log: Logger
  ): Promise<Result<ClientConfiguration>> {
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

      return { error: clientConfigurationResult.error };
    }

    const clientConfiguration = clientConfigurationResult.data;

    if (
      !clientConfiguration ||
      !this.isCampaignIdValid(clientConfiguration, campaignId)
    ) {
      log.child({ campaignId }).error('Invalid campaign ID in request');

      return failure(
        ErrorCase.VALIDATION_FAILED,
        'Invalid campaign ID in request'
      );
    }

    return success(clientConfiguration);
  }
}
