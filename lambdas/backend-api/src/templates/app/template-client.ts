import { logger, success, validate } from '@backend-api/utils/index';
import {
  CreateTemplate,
  ITemplateClient,
  Result,
  TemplateDTO,
  UpdateTemplate,
} from 'nhs-notify-backend-client';
import {
  $CreateTemplateSchema,
  $UpdateTemplateSchema,
  templateRepository,
} from '@backend-api/templates/domain/template';

export class TemplateClient implements ITemplateClient {
  constructor(private readonly _owner: string) {}

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

    return success(createResult.data);
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

    return success(updateResult.data);
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

    return success(getResult.data);
  }

  async listTemplates(): Promise<Result<TemplateDTO[]>> {
    const listResult = await templateRepository.list(this._owner);

    if (listResult.error) {
      logger.error('Failed to list templates', { listResult });

      return listResult;
    }

    return success(listResult.data);
  }
}
