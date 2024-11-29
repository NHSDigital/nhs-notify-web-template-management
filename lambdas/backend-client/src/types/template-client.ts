import {
  TemplateDTO,
  CreateTemplateInput,
  UpdateTemplateInput,
} from './template';
import { Result } from './result';

export interface ITemplateClient {
  createTemplate(
    template: CreateTemplateInput,
    token: string
  ): Promise<Result<TemplateDTO>>;

  updateTemplate(
    template: UpdateTemplateInput,
    token: string
  ): Promise<Result<TemplateDTO>>;

  getTemplate(templateId: string, token: string): Promise<Result<TemplateDTO>>;
}
