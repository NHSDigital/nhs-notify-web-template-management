import type { APIGatewayProxyHandler } from 'aws-lambda';
import { updateTemplate } from '@backend-api/templates/app/update-template';
import { failure, success } from './responses';

export const handler: APIGatewayProxyHandler = async (event) => {
  const token = event.headers.Authorization;

  const dto = JSON.parse(event.body || '{}');

  if (!token) {
    return failure(400, 'Invalid request');
  }

  const templateResult = await updateTemplate(dto, token);

  if (templateResult.error) {
    return failure(templateResult.error.code, templateResult.error.message);
  }

  return success(200, templateResult.data);
};
