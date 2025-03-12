import { failure, logger, success, validate } from '@backend-api/utils/index';
import {
  CreateTemplate,
  ITemplateClient,
  Result,
  TemplateDto,
  UpdateTemplate,
  $UpdateTemplateSchema,
  ErrorCase,
  isTemplateDtoValid,
  LetterFiles,
  TemplateStatus,
  $CreateTemplateSchema,
} from 'nhs-notify-backend-client';
import {
  DatabaseTemplate,
  TemplateRepository,
} from '@backend-api/templates/infra';
import { LETTER_MULTIPART } from 'nhs-notify-backend-client/src/schemas/constants';
import { $CreateLetterTemplate } from 'nhs-notify-web-template-management-utils';
import { LetterUploadRepository } from '../infra/letter-upload-repository';

export class TemplateClient implements ITemplateClient {
  constructor(
    private readonly enableLetters: boolean,
    private readonly templateRepository: TemplateRepository,
    private readonly letterUploadRepository: LetterUploadRepository,
    private readonly generateId: () => string
  ) {}

  async createTemplate(
    template: CreateTemplate,
    owner: string
  ): Promise<Result<TemplateDto>> {
    const log = logger.child({ template });

    const validationResult = await validate($CreateTemplateSchema, template);

    if (validationResult.error) {
      log.error('Request failed validation', {
        validationResult,
        template,
      });

      return validationResult;
    }

    const createResult = await this.templateRepository.create(
      validationResult.data,
      owner,
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
      return failure(ErrorCase.IO_FAILURE, 'Error retrieving template');
    }

    return success(templateDTO);
  }

  async createLetterTemplate(
    template: CreateTemplate,
    owner: string,
    pdf: File,
    csv?: File
  ): Promise<Result<TemplateDto>> {
    const log = logger.child({
      template,
    });

    const templateValidationResult = await validate(
      $CreateLetterTemplate,
      template
    );

    if (templateValidationResult.error) {
      log.error('Request failed validation', {
        validationResult: templateValidationResult,
        template,
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

    const versionId = this.generateId();

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
    };

    const withFiles = {
      ...templateValidationResult.data,
      files,
    };

    const createResult = await this.templateRepository.create(
      withFiles,
      owner,
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
      return failure(ErrorCase.IO_FAILURE, 'Error retrieving template');
    }

    const uploadResult = await this.letterUploadRepository.upload(
      templateDTO.id,
      owner,
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

    const update: UpdateTemplate = {
      ...templateDTO,
      templateStatus: 'PENDING_VALIDATION',
    };

    const updateTemplateResult = await this.updateTemplate(
      templateDTO.id,
      update,
      owner,
      'PENDING_UPLOAD'
    );

    if (updateTemplateResult.error) return updateTemplateResult;

    return success(updateTemplateResult.data);
  }

  async updateTemplate(
    templateId: string,
    template: UpdateTemplate,
    owner: string,
    expectedStatus: TemplateStatus = 'NOT_YET_SUBMITTED'
  ): Promise<Result<TemplateDto>> {
    const log = logger.child({
      templateId,
      template,
    });

    const validationResult = await validate($UpdateTemplateSchema, template);

    if (validationResult.error) {
      log.error('Invalid template', { validationResult });

      return validationResult;
    }

    const updateResult = await this.templateRepository.update(
      templateId,
      validationResult.data,
      owner,
      expectedStatus
    );

    if (updateResult.error) {
      log.error('Failed to update template', { updateResult });

      return updateResult;
    }

    const templateDTO = this.mapDatabaseObjectToDTO(updateResult.data);
    if (!templateDTO) {
      return failure(ErrorCase.IO_FAILURE, 'Error retrieving template');
    }

    return success(templateDTO);
  }

  async getTemplate(
    templateId: string,
    owner: string
  ): Promise<Result<TemplateDto>> {
    const log = logger.child({
      templateId,
    });

    const getResult = await this.templateRepository.get(templateId, owner);

    if (getResult.error) {
      log.error('Failed to get template', { getResult });

      return getResult;
    }

    if (getResult.data.templateType === 'LETTER' && !this.enableLetters) {
      return failure(ErrorCase.TEMPLATE_NOT_FOUND, 'Template not found');
    }

    const templateDTO = this.mapDatabaseObjectToDTO(getResult.data);
    if (!templateDTO) {
      return failure(ErrorCase.IO_FAILURE, 'Error retrieving template');
    }

    return success(templateDTO);
  }

  private mapDatabaseObjectToDTO(
    databaseTemplate: DatabaseTemplate
  ): TemplateDto | undefined {
    const { owner: _1, version: _2, ...templateDTO } = databaseTemplate;

    return isTemplateDtoValid(templateDTO);
  }

  async listTemplates(owner: string): Promise<Result<TemplateDto[]>> {
    const listResult = await this.templateRepository.list(owner);

    if (listResult.error) {
      logger.error('Failed to list templates', { listResult });

      return listResult;
    }

    const templateDTOs = listResult.data
      .map((template) => this.mapDatabaseObjectToDTO(template))
      .flatMap((t) => t ?? [])
      .filter((t) => this.enableLetters || t.templateType !== 'LETTER');

    return success(templateDTOs);
  }
}
