import type { APIGatewayProxyHandler } from 'aws-lambda';
import { createTemplate } from '@backend-api/templates/app/create-template';
import { apiFailure, apiSuccess } from './responses';

export const handler: APIGatewayProxyHandler = async (event) => {
  const username = event.requestContext.authorizer?.username;

  const dto = JSON.parse(event.body || '{}');

  if (!username) {
    return apiFailure(400, 'Invalid request');
  }

  const { data, error } = await createTemplate(dto, username);

  if (error) {
    return apiFailure(error.code, error.message, error.details);
  }

  return apiSuccess(201, data);
};
