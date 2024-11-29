import axios from 'axios';
import { ITemplateClient } from './types/template-client';
import {
  CreateTemplate,
  Failure,
  Success,
  TemplateDTO,
  UpdateTemplate,
} from './types/generated';
import { Result } from './types/result';

type ApiResponse = Failure | Success;

const client = axios.create({
  baseURL: process.env.TEMPLATE_API_URL,
});

function map(
  successCode: 200 | 201,
  response: ApiResponse
): Result<TemplateDTO> {
  if (response.statusCode === successCode) {
    const success = response as Success;
    return {
      data: success.template,
    };
  }

  const failure = response as Failure;
  return {
    error: {
      code: failure.statusCode,
      message: failure.technicalMessage,
    },
  };
}

export const templateClient: ITemplateClient = {
  createTemplate: async (template: CreateTemplate, token: string) => {
    const response = await client.post<ApiResponse>('/v1/template', template, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return map(201, response.data);
  },
  updateTemplate: async (template: UpdateTemplate, token: string) => {
    const response = await client.post<ApiResponse>('/v1/templates', template, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return map(200, response.data);
  },
  getTemplate: async (templateId: string, token: string) => {
    const response = await client.get<ApiResponse>(
      `/v1/template/${templateId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return map(200, response.data);
  },
};
