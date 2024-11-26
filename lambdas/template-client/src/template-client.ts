import axios, { AxiosInstance } from 'axios';
import {
  TemplateDTO,
  CreateTemplateInput,
  UpdateTemplateInput,
} from './types/template';
import { ITemplateClient } from './types/template-client';
import { Result } from './types/result';

const client: AxiosInstance = axios.create({
  baseURL: process.env.TEMPLATE_API_URL,
});

const createTemplate = async (template: CreateTemplateInput, token: string) => {
  const response = await client.post<Result<TemplateDTO>>(
    '/v1/templates',
    template,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

const updateTemplate = async (template: UpdateTemplateInput, token: string) => {
  const response = await client.post<Result<TemplateDTO>>(
    `/v1/template/${template.id}`,
    template,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

const getTemplate = async (templateId: string, token: string) => {
  const response = await client.get<Result<TemplateDTO>>(
    `/v1/template/${templateId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const templateClient: ITemplateClient = {
  createTemplate,
  updateTemplate,
  getTemplate,
};
