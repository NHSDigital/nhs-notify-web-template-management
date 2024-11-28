import type { APIGatewayProxyHandler } from 'aws-lambda';
import { failure, success } from './response';
import { getTemplate } from '../app';

export const handler: APIGatewayProxyHandler = async (event) => {
  const token = event.headers.Authorization;

  const templateId = event.pathParameters?.templateId;

  if (!token || !templateId) {
    return failure(400, 'Invalid request');
  }

  const templateResult = await getTemplate(templateId, token);

  if (templateResult.error) {
    return failure(templateResult.error.code, templateResult.error.message);
  }

  return success(200, templateResult.data);
};
