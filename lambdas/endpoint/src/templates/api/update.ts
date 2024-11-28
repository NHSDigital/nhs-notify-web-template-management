import type { APIGatewayProxyHandler } from 'aws-lambda';
import { failure, success } from './responses';
import { updateTemplate } from '@templates/app/update-template';

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
