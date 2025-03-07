import { TemplateDto, CreateTemplate, UpdateTemplate } from './generated';
import { Result } from './result';

export interface ITemplateClient {
  createTemplate(template: CreateTemplate): Promise<Result<TemplateDto>>;

  updateTemplate(
    templateId: string,
    template: UpdateTemplate
  ): Promise<Result<TemplateDto>>;

  getTemplate(templateId: string): Promise<Result<TemplateDto>>;

  listTemplates(): Promise<Result<TemplateDto[]>>;
}
