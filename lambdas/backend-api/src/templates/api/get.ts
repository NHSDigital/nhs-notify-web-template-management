import type { APIGatewayProxyHandler } from 'aws-lambda';
import { getTemplate } from '@backend-api/templates/app/get-template';
import { apiFailure, apiSuccess } from './responses';

export const handler: APIGatewayProxyHandler = async (event) => {
  const username = event.requestContext.authorizer?.username;

  const templateId = event.pathParameters?.templateId;

  if (!username || !templateId) {
    return apiFailure(400, 'Invalid request');
  }

  const { data, error } = await getTemplate(templateId, username);

  if (error) {
    return apiFailure(error.code, error.message, error.details);
  }

  return apiSuccess(200, data);
};
