import axios from 'axios';
import { ITemplateClient } from './types/template-client';
import {
  CreateTemplate,
  Failure,
  Success,
  SuccessList,
  TemplateDTO,
  UpdateTemplate,
} from './types/generated';
import { Result } from './types/result';

type ApiResponse = Failure | Success | SuccessList;

export class TemplateApiClient implements ITemplateClient {
  private readonly _client: axios.AxiosInstance;

  constructor(token: string) {
    this._client = axios.create({
      baseURL: process.env.TEMPLATE_API_URL,
      headers: {
        Authorization: token,
      },
    });
  }

  async createTemplate(template: CreateTemplate): Promise<Result<TemplateDTO>> {
    const response = await this._client.post<ApiResponse>(
      '/v1/template',
      template
    );

    if (response.data.statusCode !== 201) {
      return this.failure(response.data as Failure);
    }

    return {
      data: (response.data as Success).template,
    };
  }

  async updateTemplate(
    templateId: string,
    template: UpdateTemplate
  ): Promise<Result<TemplateDTO>> {
    const response = await this._client.post<ApiResponse>(
      `/v1/template/${templateId}`,
      template
    );

    if (response.data.statusCode !== 200) {
      return this.failure(response.data as Failure);
    }

    return {
      data: (response.data as Success).template,
    };
  }

  async getTemplate(templateId: string): Promise<Result<TemplateDTO>> {
    const response = await this._client.get<ApiResponse>(
      `/v1/template/${templateId}`
    );

    if (response.data.statusCode !== 200) {
      return this.failure(response.data as Failure);
    }

    return {
      data: (response.data as Success).template,
    };
  }

  async listTemplates(): Promise<Result<TemplateDTO[]>> {
    const response = await this._client.get<ApiResponse>('/v1/templates');

    if (response.data.statusCode !== 200) {
      return this.failure(response.data as Failure);
    }

    return {
      data: (response.data as SuccessList).items,
    };
  }

  private failure(data: Failure) {
    return {
      error: {
        code: data.statusCode,
        message: data.technicalMessage,
        details: data.details,
      },
    };
  }
}
