import {
  CreateUpdateTemplate,
  TemplateSuccess,
  TemplateSuccessList,
  TemplateDto,
} from './types/generated';
import { Result } from './types/result';
import {
  AxiosRetryClient,
  catchAxiosError,
  createAxiosClient,
} from './axios-client';
import { LETTER_MULTIPART } from './schemas/constants';

export class TemplateApiClient {
  private readonly _client: AxiosRetryClient;

  constructor() {
    this._client = createAxiosClient();
  }

  async createTemplate(
    template: CreateUpdateTemplate,
    token: string
  ): Promise<Result<TemplateDto>> {
    const response = await catchAxiosError(
      this._client.post<TemplateSuccess>('/v1/template', template, {
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
      data: response.data.data,
    };
  }

  async uploadLetterTemplate(
    template: CreateUpdateTemplate,
    token: string,
    pdf: File,
    csv?: File
  ): Promise<Result<TemplateDto>> {
    const formData = new FormData();
    formData.append(LETTER_MULTIPART.TEMPLATE.name, JSON.stringify(template));
    formData.append(LETTER_MULTIPART.PDF.name, pdf);

    if (csv) formData.append(LETTER_MULTIPART.CSV.name, csv);

    const response = await catchAxiosError(
      this._client.post<TemplateSuccess>('/v1/letter-template', formData, {
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
      data: response.data.data,
    };
  }

  async updateTemplate(
    templateId: string,
    template: CreateUpdateTemplate,
    token: string
  ): Promise<Result<TemplateDto>> {
    const response = await catchAxiosError(
      this._client.put<TemplateSuccess>(
        `/v1/template/${encodeURIComponent(templateId)}`,
        template,
        {
          headers: { Authorization: token },
        }
      )
    );

    if (response.error) {
      return {
        error: response.error,
      };
    }

    return {
      data: response.data.data,
    };
  }

  async getTemplate(
    templateId: string,
    token: string
  ): Promise<Result<TemplateDto>> {
    const response = await catchAxiosError(
      this._client.get<TemplateSuccess>(
        `/v1/template/${encodeURIComponent(templateId)}`,
        {
          headers: { Authorization: token },
        }
      )
    );

    if (response.error) {
      return {
        error: response.error,
      };
    }

    return {
      data: response.data.data,
    };
  }

  async listTemplates(token: string): Promise<Result<TemplateDto[]>> {
    const response = await catchAxiosError(
      this._client.get<TemplateSuccessList>('/v1/templates', {
        headers: { Authorization: token },
      })
    );

    if (response.error) {
      return {
        error: response.error,
      };
    }

    return {
      data: response.data.data,
    };
  }

  async submitTemplate(
    templateId: string,
    owner: string
  ): Promise<Result<TemplateDto>> {
    const response = await catchAxiosError(
      this._client.patch<TemplateSuccess>(
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
      data: response.data.data,
    };
  }

  async deleteTemplate(
    templateId: string,
    owner: string
  ): Promise<Result<void>> {
    const response = await catchAxiosError(
      this._client.delete<TemplateSuccess>(
        `/v1/template/${encodeURIComponent(templateId)}`,
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
      data: undefined,
    };
  }

  async requestProof(
    templateId: string,
    owner: string
  ): Promise<Result<TemplateDto>> {
    const response = await catchAxiosError(
      this._client.post<TemplateSuccess>(
        `/v1/template/${encodeURIComponent(templateId)}/proof`,
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
      data: response.data.data,
    };
  }
}

export const templateApiClient = new TemplateApiClient();
