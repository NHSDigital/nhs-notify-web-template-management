import type { APIGatewayProxyHandler } from 'aws-lambda';
import { createTemplate } from '@backend-api/templates/app/create-template';
import { apiFailure, apiSuccess } from './responses';

export const handler: APIGatewayProxyHandler = async (event) => {
  const token = event.headers.Authorization;

  const dto = JSON.parse(event.body || '{}');

  if (!token) {
    return apiFailure(400, 'Invalid request');
  }

  const templateResult = await createTemplate(dto, token);

  if (templateResult.error) {
    return apiFailure(templateResult.error.code, templateResult.error.message);
  }

  return apiSuccess(201, templateResult.data);
};