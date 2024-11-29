import type { APIGatewayProxyHandler } from 'aws-lambda';
import { updateTemplate } from '@backend-api/templates/app/update-template';
import { apiFailure, apiSuccess } from './responses';

export const handler: APIGatewayProxyHandler = async (event) => {
  const token = event.headers.Authorization;

  const dto = JSON.parse(event.body || '{}');

  if (!token) {
    return apiFailure(400, 'Invalid request');
  }

  const templateResult = await updateTemplate(dto, token);

  if (templateResult.error) {
    return apiFailure(templateResult.error.code, templateResult.error.message);
  }

  return apiSuccess(200, templateResult.data);
};
