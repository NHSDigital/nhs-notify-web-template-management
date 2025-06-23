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
} from 'nhs-notify-backend-client';
import { TemplateRepository } from '@backend-api/templates/infra';
import { LETTER_MULTIPART } from 'nhs-notify-backend-client/src/schemas/constants';
import {
  $CreateLetterTemplate,
  DatabaseTemplate,
} from 'nhs-notify-web-template-management-utils';
import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { LetterUploadRepository } from '../infra/letter-upload-repository';
import { ProofingQueue } from '../infra/proofing-queue';

export class TemplateClient {
  constructor(
    private readonly templateRepository: TemplateRepository,
    private readonly letterUploadRepository: LetterUploadRepository,
    private readonly proofingQueue: ProofingQueue,
    private readonly defaultLetterSupplier: string,
    private readonly logger: Logger
  ) {}

  async createTemplate(
    template: CreateUpdateTemplate,
    userId: string,
    clientId: string | undefined
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({ template, userId });

    const validationResult = await validate($CreateUpdateNonLetter, template);

    if (validationResult.error) {
      log.error('Request failed validation', {
        validationResult,
      });

      return validationResult;
    }

    const createResult = await this.templateRepository.create(
      validationResult.data,
      userId,
      clientId,
      'NOT_YET_SUBMITTED'
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
    userId: string,
    clientId: string | undefined,
    pdf: File,
    csv?: File
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({
      template,
      userId,
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

    const createResult = await this.templateRepository.create(
      withFiles,
      userId,
      clientId,
      'PENDING_UPLOAD'
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
      userId,
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
      userId
    );

    if (updateTemplateResult.error) return updateTemplateResult;

    return success(updateTemplateResult.data);
  }

  async updateTemplate(
    templateId: string,
    template: CreateUpdateTemplate,
    userId: string,
    expectedStatus: TemplateStatus = 'NOT_YET_SUBMITTED'
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({
      templateId,
      template,
    });

    const validationResult = await validate($CreateUpdateNonLetter, template);

    if (validationResult.error) {
      log.error('Invalid template', { validationResult });

      return validationResult;
    }

    const updateResult = await this.templateRepository.update(
      templateId,
      validationResult.data,
      userId,
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
    userId: string
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({ templateId });

    const submitResult = await this.templateRepository.submit(
      templateId,
      userId
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
    userId: string
  ): Promise<Result<void>> {
    const log = this.logger.child({ templateId, userId });

    const deleteResult = await this.templateRepository.delete(
      templateId,
      userId
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
    userId: string
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({
      templateId,
      userId,
    });

    const getResult = await this.templateRepository.get(templateId, userId);

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

  async listTemplates(owner: string): Promise<Result<TemplateDto[]>> {
    const listResult = await this.templateRepository.list(owner);

    if (listResult.error) {
      this.logger.error('Failed to list templates', { listResult, owner });

      return listResult;
    }

    const templateDTOs = listResult.data
      .map((template) => this.mapDatabaseObjectToDTO(template))
      .flatMap((t) => t ?? []);

    return success(templateDTOs);
  }

  async requestProof(
    templateId: string,
    userId: string
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({ templateId, userId });

    const proofRequestUpdateResult =
      await this.templateRepository.proofRequestUpdate(templateId, userId);

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

    if (!templateDTO || templateDTO.templateType !== 'LETTER') {
      log.error({
        code: ErrorCase.INTERNAL,
        description: 'Malformed template',
      });

      return failure(ErrorCase.INTERNAL, 'Malformed template');
    }

    const pdfVersionId = templateDTO.files.pdfTemplate.currentVersion;
    const testDataVersionId = templateDTO.files.testDataCsv?.currentVersion;
    const personalisationParameters = templateDTO.personalisationParameters;

    const sendQueueResult = await this.proofingQueue.send(
      templateId,
      userId,
      personalisationParameters!,
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
    userId: string
  ): Promise<Result<TemplateDto>> {
    const log = this.logger.child({ templateId });

    const updateStatusResult = await this.templateRepository.updateStatus(
      templateId,
      userId,
      status
    );

    if (updateStatusResult.error) {
      log.error('Failed to save template to the database', {
        createResult: updateStatusResult,
      });

      return updateStatusResult;
    }

    const templateDTO = this.mapDatabaseObjectToDTO(updateStatusResult.data);

    if (!templateDTO) {
      return failure(ErrorCase.INTERNAL, 'Error retrieving template');
    }

    return success(templateDTO);
  }

  private mapDatabaseObjectToDTO(
    databaseTemplate: DatabaseTemplate
  ): TemplateDto | undefined {
    const { owner: _1, version: _2, ...templateDTO } = databaseTemplate;

    return isTemplateDtoValid(templateDTO);
  }
}
