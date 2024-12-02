import type { APIGatewayProxyHandler } from 'aws-lambda';
import { getTemplate } from '@backend-api/templates/app/get-template';
import { apiFailure, apiSuccess } from './responses';

export const handler: APIGatewayProxyHandler = async (event) => {
  const token = event.headers.Authorization;

  const templateId = event.pathParameters?.templateId;

  if (!token || !templateId) {
    return apiFailure(400, 'Invalid request');
  }

  const { data, error } = await getTemplate(templateId, token);

  if (error) {
    return apiFailure(error.code, error.message, error.details);
  }

  return apiSuccess(200, data);
};
