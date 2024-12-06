import { TemplateDTO, CreateTemplate, UpdateTemplate } from './generated';
import { Result } from './result';

export interface ITemplateClient {
  createTemplate(template: CreateTemplate): Promise<Result<TemplateDTO>>;

  updateTemplate(
    templateId: string,
    template: UpdateTemplate
  ): Promise<Result<TemplateDTO>>;

  getTemplate(templateId: string): Promise<Result<TemplateDTO>>;

  listTemplates(): Promise<Result<TemplateDTO[]>>;
}
