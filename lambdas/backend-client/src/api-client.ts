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

export class TemplateApiClient implements ITemplateClient {
  private readonly _client;

  constructor(token: string) {
    this._client = axios.create({
      baseURL: process.env.TEMPLATE_API_URL,
      headers: {
        Authorization: token,
      },
    });
  }

  async createTemplate(template: CreateTemplate): Promise<Result<TemplateDTO>> {
    const response = await this._client.post<Failure | Success>(
      '/v1/template',
      template
    );

    if (this.isFailure(response.data)) {
      return this.failure(response.data);
    }

    return {
      data: response.data.template,
    };
  }

  async updateTemplate(
    templateId: string,
    template: UpdateTemplate
  ): Promise<Result<TemplateDTO>> {
    const response = await this._client.post<Failure | Success>(
      `/v1/template/${templateId}`,
      template
    );

    if (this.isFailure(response.data)) {
      return this.failure(response.data);
    }

    return {
      data: response.data.template,
    };
  }

  async getTemplate(templateId: string): Promise<Result<TemplateDTO>> {
    const response = await this._client.get<Failure | Success>(
      `/v1/template/${templateId}`
    );

    if (this.isFailure(response.data)) {
      return this.failure(response.data);
    }

    return {
      data: response.data.template,
    };
  }

  async listTemplates(): Promise<Result<TemplateDTO[]>> {
    const response = await this._client.get<Failure | SuccessList>(
      '/v1/templates'
    );

    if (this.isFailure(response.data)) {
      return this.failure(response.data);
    }

    return {
      data: response.data.templates,
    };
  }

  private isFailure(
    response: Failure | Success | SuccessList
  ): response is Failure {
    return ![200, 201].includes(response.statusCode);
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
