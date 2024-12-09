import type { APIGatewayProxyHandler } from 'aws-lambda';
import { TemplateClient } from '@backend-api/templates/app/template-client';
import { apiFailure, apiSuccess } from './responses';

export const handler: APIGatewayProxyHandler = async (event) => {
  const email = event.requestContext.authorizer?.email;

  if (!email) {
    return apiFailure(400, 'Invalid request');
  }

  const client = new TemplateClient(email);

  const { data, error } = await client.listTemplates();

  if (error) {
    return apiFailure(error.code, error.message, error.details);
  }

  return apiSuccess(200, data);
};
