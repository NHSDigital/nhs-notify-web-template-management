import { TemplateDTO, CreateTemplate, UpdateTemplate } from './generated';
import { Result } from './result';

export interface ITemplateClient {
  createTemplate(
    template: CreateTemplate,
    token: string
  ): Promise<Result<TemplateDTO>>;

  updateTemplate(
    templateId: string,
    template: UpdateTemplate,
    token: string
  ): Promise<Result<TemplateDTO>>;

  getTemplate(templateId: string, token: string): Promise<Result<TemplateDTO>>;

  listTemplates(token: string): Promise<Result<TemplateDTO[]>>;
}
