import { TemplateDto, CreateUpdateTemplate } from './generated';
import { Result } from './result';

export interface ITemplateClient {
  createTemplate(
    template: CreateUpdateTemplate,
    owner: string
  ): Promise<Result<TemplateDto>>;

  createLetterTemplate(
    template: CreateUpdateTemplate,
    owner: string,
    pdf: File,
    csv?: File
  ): Promise<Result<TemplateDto>>;

  updateTemplate(
    templateId: string,
    template: CreateUpdateTemplate,
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
