import { ITemplateClient } from './types/template-client';
import {
  CreateTemplate,
  Success,
  SuccessList,
  TemplateDTO,
  UpdateTemplate,
} from './types/generated';
import { Result } from './types/result';
import {
  AxiosRetryClient,
  catchAxiosError,
  createAxiosClient,
} from './axios-client';

export class TemplateApiClient implements ITemplateClient {
  private readonly _client: AxiosRetryClient;

  constructor(token: string) {
    this._client = createAxiosClient(token);
  }

  async createTemplate(template: CreateTemplate): Promise<Result<TemplateDTO>> {
    const response = await catchAxiosError(
      this._client.post<Success>('/v1/template', template)
    );

    if (response.error) {
      return {
        error: response.error,
      };
    }

    return {
      data: response.data.template,
    };
  }

  async updateTemplate(
    templateId: string,
    template: UpdateTemplate
  ): Promise<Result<TemplateDTO>> {
    const response = await catchAxiosError(
      this._client.post<Success>(`/v1/template/${templateId}`, template)
    );

    if (response.error) {
      return {
        error: response.error,
      };
    }

    return {
      data: response.data.template,
    };
  }

  async getTemplate(templateId: string): Promise<Result<TemplateDTO>> {
    const response = await catchAxiosError(
      this._client.get<Success>(`/v1/template/${templateId}`)
    );

    if (response.error) {
      return {
        error: response.error,
      };
    }

    return {
      data: response.data.template,
    };
  }

  async listTemplates(): Promise<Result<TemplateDTO[]>> {
    const response = await catchAxiosError(
      this._client.get<SuccessList>('/v1/templates')
    );

    if (response.error) {
      return {
        error: response.error,
      };
    }

    return {
      data: response.data.templates,
    };
  }
}
