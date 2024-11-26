import type { APIGatewayProxyHandler } from 'aws-lambda';
import { TemplateDTO } from 'nhs-notify-templates-client';
import { app } from './app';

const success = (statusCode: number, template: TemplateDTO) => ({
  statusCode,
  body: JSON.stringify({ statusCode, template }),
});

const failure = (statusCode: number, technicalMessage: string) => ({
  statusCode,
  body: JSON.stringify({ statusCode, technicalMessage }),
});

export const create: APIGatewayProxyHandler = async (event) => {
  const token = event.headers.Authorization;
  const body = event.body || '{}';
  const dto = JSON.parse(body);

  if (!token || !dto) {
    failure(400, 'Invalid request');
  }

  const templateResult = await app.createTemplate(dto, String(token));

  if (templateResult.error) {
    return failure(templateResult.error.code, templateResult.error.message);
  }

  return success(201, templateResult.data);
};

export const get: APIGatewayProxyHandler = async (event) => {
  const token = event.headers.Authorization;
  const templateId = event.pathParameters?.templateId;

  if (!token || !templateId) {
    failure(400, 'Invalid request');
  }

  const templateResult = await app.getTemplate(
    String(templateId),
    String(token)
  );

  if (templateResult.error) {
    return failure(templateResult.error.code, templateResult.error.message);
  }

  return success(200, templateResult.data);
};

export const update: APIGatewayProxyHandler = async (event) => {
  const token = event.headers.Authorization;
  const dto = JSON.parse(String(event.body)) as TemplateDTO;

  if (!token || !dto) {
    failure(400, 'Invalid request');
  }

  const templateResult = await app.updateTemplate(dto, String(token));

  if (templateResult.error) {
    return failure(templateResult.error.code, templateResult.error.message);
  }

  return success(200, templateResult.data);
};
