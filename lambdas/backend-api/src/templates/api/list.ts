import type { APIGatewayProxyHandler } from 'aws-lambda';
import { listTemplates } from '@backend-api/templates/app/list-templates';
import { apiFailure, apiSuccess } from './responses';

export const handler: APIGatewayProxyHandler = async (event) => {
  const token = event.headers.Authorization;

  if (!token) {
    return apiFailure(400, 'Invalid request');
  }

  const { data, error } = await listTemplates(token);

  if (error) {
    return apiFailure(error.code, error.message, error.details);
  }

  return apiSuccess(200, data);
};
