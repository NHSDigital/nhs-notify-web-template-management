import { failure, logger, success, validate } from '@backend-api/utils/index';
import {
  CreateTemplate,
  ITemplateClient,
  Result,
  TemplateDTO,
  UpdateTemplate,
  $CreateTemplateSchema,
  $UpdateTemplateSchema,
  TemplateType,
  ErrorCase,
} from 'nhs-notify-backend-client';
import {
  DatabaseTemplate,
  templateRepository,
} from '@backend-api/templates/infra';

export class TemplateClient implements ITemplateClient {
  constructor(
    private readonly _owner: string,
    private readonly enableLetters: boolean
  ) {}

  async createTemplate(template: CreateTemplate): Promise<Result<TemplateDTO>> {
    const log = logger.child({
      template,
    });

    const validationResult = await validate($CreateTemplateSchema, template);

    if (validationResult.error) {
      log.error('Request failed validation', {
        validationResult,
        template,
      });

      return validationResult;
    }

    const createResult = await templateRepository.create(
      validationResult.data,
      this._owner
    );

    if (createResult.error) {
      log.error('Failed to save template to the database', {
        createResult,
      });

      return createResult;
    }

    return success(this.mapDatabaseObjectToDTO(createResult.data));
  }

  async updateTemplate(
    templateId: string,
    template: UpdateTemplate
  ): Promise<Result<TemplateDTO>> {
    const log = logger.child({
      templateId,
      template,
    });

    const validationResult = await validate($UpdateTemplateSchema, template);

    if (validationResult.error) {
      log.error('Invalid template', { validationResult });

      return validationResult;
    }

    const updateResult = await templateRepository.update(
      templateId,
      validationResult.data,
      this._owner
    );

    if (updateResult.error) {
      log.error('Failed to update template', { updateResult });

      return updateResult;
    }

    return success(this.mapDatabaseObjectToDTO(updateResult.data));
  }

  async getTemplate(templateId: string): Promise<Result<TemplateDTO>> {
    const log = logger.child({
      templateId,
    });

    const getResult = await templateRepository.get(templateId, this._owner);

    if (getResult.error) {
      log.error('Failed to get template', { getResult });

      return getResult;
    }

    if (
      getResult.data.templateType === TemplateType.LETTER &&
      !this.enableLetters
    ) {
      return failure(ErrorCase.TEMPLATE_NOT_FOUND, 'Template not found');
    }

    return success(this.mapDatabaseObjectToDTO(getResult.data));
  }

  private mapDatabaseObjectToDTO(
    databaseTemplate: DatabaseTemplate
  ): TemplateDTO {
    const { owner: _1, version: _2, ...templateDTO } = databaseTemplate;

    return templateDTO;
  }

  async listTemplates(): Promise<Result<TemplateDTO[]>> {
    const listResult = await templateRepository.list(this._owner);

    if (listResult.error) {
      logger.error('Failed to list templates', { listResult });

      return listResult;
    }

    const templateDTOs = listResult.data
      .map((template) => this.mapDatabaseObjectToDTO(template))
      .filter(
        (t) => this.enableLetters || t.templateType !== TemplateType.LETTER
      );

    return success(templateDTOs);
  }
}
