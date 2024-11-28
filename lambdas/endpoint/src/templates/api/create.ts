import type { APIGatewayProxyHandler } from 'aws-lambda';
import { failure, success } from './responses';
import { createTemplate } from '@templates/app/create-template';

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
