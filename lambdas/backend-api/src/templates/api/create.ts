import type { APIGatewayProxyHandler } from 'aws-lambda';
import { createTemplate } from '@backend-api/templates/app/create-template';
import { failure, success } from './responses';

export const handler: APIGatewayProxyHandler = async (event) => {
  const token = event.headers.Authorization;

  const dto = JSON.parse(event.body || '{}');

  if (!token) {
    return failure(400, 'Invalid request');
  }

  const templateResult = await createTemplate(dto, token);

  if (templateResult.error) {
    return failure(templateResult.error.code, templateResult.error.message);
  }

  return success(201, templateResult.data);
};
