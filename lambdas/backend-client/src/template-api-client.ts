import { ITemplateClient } from './types/template-client';
import {
  CreateTemplate,
  Success,
  SuccessList,
  TemplateDto,
  UpdateTemplate,
} from './types/generated';
import { Result } from './types/result';
import {
  AxiosRetryClient,
  catchAxiosError,
  createAxiosClient,
} from './axios-client';
import { LETTER_MULTIPART } from './schemas/constants';

export class TemplateApiClient implements ITemplateClient {
  private readonly _client: AxiosRetryClient;

  constructor() {
    this._client = createAxiosClient();
  }

  async createTemplate(
    template: CreateTemplate,
    token: string
  ): Promise<Result<TemplateDto>> {
    const response = await catchAxiosError(
      this._client.post<Success>('/v1/template', template, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      })
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

  async createLetterTemplate(
    template: CreateTemplate,
    token: string,
    pdf: File,
    csv?: File
  ): Promise<Result<TemplateDto>> {
    const formData = new FormData();
    formData.append(LETTER_MULTIPART.TEMPLATE.name, JSON.stringify(template));
    formData.append(LETTER_MULTIPART.PDF.name, pdf);

    if (csv) formData.append(LETTER_MULTIPART.CSV.name, csv);

    const response = await catchAxiosError(
      this._client.post<Success>('/v1/letter-template', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token,
        },
      })
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
    template: UpdateTemplate,
    token: string
  ): Promise<Result<TemplateDto>> {
    const response = await catchAxiosError(
      this._client.post<Success>(`/v1/template/${templateId}`, template, {
        headers: { Authorization: token },
      })
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

  async getTemplate(
    templateId: string,
    token: string
  ): Promise<Result<TemplateDto>> {
    const response = await catchAxiosError(
      this._client.get<Success>(`/v1/template/${templateId}`, {
        headers: { Authorization: token },
      })
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

  async listTemplates(token: string): Promise<Result<TemplateDto[]>> {
    const response = await catchAxiosError(
      this._client.get<SuccessList>('/v1/templates', {
        headers: { Authorization: token },
      })
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

  async submitTemplate(
    templateId: string,
    owner: string
  ): Promise<Result<TemplateDto>> {
    const response = await catchAxiosError(
      this._client.patch<Success>(
        `/v1/template/${templateId}/submit`,
        undefined,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: owner,
          },
        }
      )
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

  async deleteTemplate(
    templateId: string,
    owner: string
  ): Promise<Result<void>> {
    const response = await catchAxiosError(
      this._client.delete<Success>(`/v1/template/${templateId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: owner,
        },
      })
    );

    if (response.error) {
      return {
        error: response.error,
      };
    }

    return {
      data: undefined,
    };
  }
}

export const templateClient = new TemplateApiClient();
