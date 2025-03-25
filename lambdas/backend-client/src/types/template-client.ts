import { TemplateDto, CreateTemplate, UpdateTemplate } from './generated';
import { Result } from './result';

export interface ITemplateClient {
  createTemplate(
    template: CreateTemplate,
    owner: string
  ): Promise<Result<TemplateDto>>;

  createLetterTemplate(
    template: CreateTemplate,
    owner: string,
    pdf: File,
    csv?: File
  ): Promise<Result<TemplateDto>>;

  updateTemplate(
    templateId: string,
    template: UpdateTemplate,
    owner: string
  ): Promise<Result<TemplateDto>>;

  submitTemplate(
    templateId: string,
    owner: string
  ): Promise<Result<TemplateDto>>;

  deleteTemplate(templateId: string, owner: string): Promise<Result<void>>;

  getTemplate(templateId: string, owner: string): Promise<Result<TemplateDto>>;

  listTemplates(owner: string): Promise<Result<TemplateDto[]>>;
}
