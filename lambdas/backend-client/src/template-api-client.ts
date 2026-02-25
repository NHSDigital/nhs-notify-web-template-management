import {
  CreateUpdateTemplate,
  TemplateSuccess,
  TemplateSuccessList,
  TemplateDto,
  PatchTemplate,
  CreateContactDetailResponse,
  CreateContactDetailResponseData,
  CreateContactDetailRequest,
} from './types/generated';
import { Result } from './types/result';
import { catchAxiosError, createAxiosClient } from './axios-client';
import { LETTER_MULTIPART } from './schemas/constants';
import { TemplateFilter } from './types/filters';

export const httpClient = createAxiosClient();

export const templateApiClient = {
  async createTemplate(
    template: CreateUpdateTemplate,
    token: string
  ): Promise<Result<TemplateDto>> {
    const response = await catchAxiosError(
      httpClient.post<TemplateSuccess>('/v1/template', template, {
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
  },

  async createContactDetail(
    createContactDetailRequest: CreateContactDetailRequest,
    token: string
  ): Promise<Result<CreateContactDetailResponseData>> {
    const response = await catchAxiosError(
      httpClient.post<CreateContactDetailResponse>('/v1/create-contact-detail', createContactDetailRequest, {
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

    return response.data;
  },

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
      httpClient.post<TemplateSuccess>('/v1/letter-template', formData, {
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
  },

  async updateTemplate(
    templateId: string,
    template: CreateUpdateTemplate,
    token: string,
    lockNumber: number
  ): Promise<Result<TemplateDto>> {
    const response = await catchAxiosError(
      httpClient.put<TemplateSuccess>(
        `/v1/template/${encodeURIComponent(templateId)}`,
        template,
        {
          headers: {
            Authorization: token,
            'X-Lock-Number': String(lockNumber),
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
  },

  async patchTemplate(
    templateId: string,
    template: PatchTemplate,
    token: string,
    lockNumber: number
  ): Promise<Result<TemplateDto>> {
    const response = await catchAxiosError(
      httpClient.patch<TemplateSuccess>(
        `/v1/template/${encodeURIComponent(templateId)}`,
        template,
        {
          headers: {
            Authorization: token,
            'X-Lock-Number': String(lockNumber),
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
  },

  async getTemplate(
    templateId: string,
    token: string
  ): Promise<Result<TemplateDto>> {
    const response = await catchAxiosError(
      httpClient.get<TemplateSuccess>(
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
  },

  async listTemplates(
    token: string,
    filters?: TemplateFilter
  ): Promise<Result<TemplateDto[]>> {
    const response = await catchAxiosError(
      httpClient.get<TemplateSuccessList>('/v1/templates', {
        headers: { Authorization: token },
        params: filters,
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
  },

  async submitTemplate(
    templateId: string,
    owner: string,
    lockNumber: number
  ): Promise<Result<TemplateDto>> {
    const response = await catchAxiosError(
      httpClient.patch<TemplateSuccess>(
        `/v1/template/${templateId}/submit`,
        undefined,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: owner,
            'X-Lock-Number': String(lockNumber),
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
  },

  async deleteTemplate(
    templateId: string,
    owner: string,
    lockNumber: number
  ): Promise<Result<void>> {
    const response = await catchAxiosError(
      httpClient.delete<TemplateSuccess>(
        `/v1/template/${encodeURIComponent(templateId)}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: owner,
            'X-Lock-Number': String(lockNumber),
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
  },

  async requestProof(
    templateId: string,
    owner: string,
    lockNumber: number
  ): Promise<Result<TemplateDto>> {
    const response = await catchAxiosError(
      httpClient.post<TemplateSuccess>(
        `/v1/template/${encodeURIComponent(templateId)}/proof`,
        undefined,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: owner,
            'X-Lock-Number': String(lockNumber),
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
  },
};
