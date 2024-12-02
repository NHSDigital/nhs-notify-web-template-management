import type { APIGatewayProxyHandler } from 'aws-lambda';
import { updateTemplate } from '@backend-api/templates/app/update-template';
import { apiFailure, apiSuccess } from './responses';

export const handler: APIGatewayProxyHandler = async (event) => {
  const token = event.headers.Authorization;

  const templateId = event.pathParameters?.templateId;

  const dto = JSON.parse(event.body || '{}');

  if (!token || !templateId) {
    return apiFailure(400, 'Invalid request');
  }

  const { data, error } = await updateTemplate(templateId, dto, token);

  if (error) {
    return apiFailure(error.code, error.message, error.details);
  }

  return apiSuccess(200, data);
};
