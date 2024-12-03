import axios from 'axios';
import { ITemplateClient } from './types/template-client';
import {
  CreateTemplate,
  Failure,
  Success,
  SuccessList,
  UpdateTemplate,
} from './types/generated';

type ApiResponse = Failure | Success | SuccessList;

const client = axios.create({
  baseURL: process.env.TEMPLATE_API_URL,
});

const failure = (data: Failure) => ({
  error: {
    code: data.statusCode,
    message: data.technicalMessage,
    details: data.details,
  },
});

export const templateClient: ITemplateClient = {
  createTemplate: async (template: CreateTemplate, token: string) => {
    const response = await client.post<ApiResponse>('/v1/template', template, {
      headers: {
        Authorization: token,
      },
    });

    if (response.data.statusCode !== 201) {
      return failure(response.data as Failure);
    }

    return {
      statusCode: response.data.statusCode,
      data: (response.data as Success).template,
    };
  },
  updateTemplate: async (
    templateId: string,
    template: UpdateTemplate,
    token: string
  ) => {
    const response = await client.post<ApiResponse>(
      `/v1/template/${templateId}`,
      template,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    if (response.data.statusCode !== 200) {
      return failure(response.data as Failure);
    }

    return {
      statusCode: response.data.statusCode,
      data: (response.data as Success).template,
    };
  },
  getTemplate: async (templateId: string, token: string) => {
    const response = await client.get<ApiResponse>(
      `/v1/template/${templateId}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    if (response.data.statusCode !== 200) {
      return failure(response.data as Failure);
    }

    return {
      statusCode: response.data.statusCode,
      data: (response.data as Success).template,
    };
  },
  listTemplates: async (token: string) => {
    const response = await client.get<ApiResponse>('/v1/templates', {
      headers: {
        Authorization: token,
      },
    });

    if (response.data.statusCode !== 200) {
      return failure(response.data as Failure);
    }

    return {
      statusCode: response.data.statusCode,
      data: (response.data as SuccessList).items,
    };
  },
};
