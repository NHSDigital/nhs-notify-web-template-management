import type { APIGatewayProxyHandler } from 'aws-lambda';
import { updateTemplate } from '@backend-api/templates/app/update-template';
import { apiFailure, apiSuccess } from './responses';

export const handler: APIGatewayProxyHandler = async (event) => {
  const username = event.requestContext.authorizer?.username;

  const templateId = event.pathParameters?.templateId;

  const dto = JSON.parse(event.body || '{}');

  if (!username || !templateId) {
    return apiFailure(400, 'Invalid request');
  }

  const { data, error } = await updateTemplate(templateId, dto, username);

  if (error) {
    return apiFailure(error.code, error.message, error.details);
  }

  return apiSuccess(200, data);
};
