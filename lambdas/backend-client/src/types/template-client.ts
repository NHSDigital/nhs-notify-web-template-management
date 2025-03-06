import { TemplateDTO, CreateTemplate, UpdateTemplate } from './generated';
import { Result } from './result';

export interface ITemplateClient {
  createTemplate(
    template: CreateTemplate,
    owner: string
  ): Promise<Result<TemplateDTO>>;

  updateTemplate(
    templateId: string,
    template: UpdateTemplate,
    owner: string
  ): Promise<Result<TemplateDTO>>;

  getTemplate(templateId: string, owner: string): Promise<Result<TemplateDTO>>;

  listTemplates(owner: string): Promise<Result<TemplateDTO[]>>;

  deleteTemplate(templateId: string, owner: string): Promise<void>;
}
