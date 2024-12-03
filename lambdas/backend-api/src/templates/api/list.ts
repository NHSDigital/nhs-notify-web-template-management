import type { APIGatewayProxyHandler } from 'aws-lambda';
import { listTemplates } from '@backend-api/templates/app/list-templates';
import { apiFailure, apiSuccess } from './responses';

export const handler: APIGatewayProxyHandler = async (event) => {
  const username = event.requestContext.authorizer?.username;

  if (!username) {
    return apiFailure(400, 'Invalid request');
  }

  const { data, error } = await listTemplates(username);

  if (error) {
    return apiFailure(error.code, error.message, error.details);
  }

  return apiSuccess(200, data);
};
