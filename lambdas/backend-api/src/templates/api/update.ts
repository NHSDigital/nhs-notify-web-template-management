import type { APIGatewayProxyHandler } from 'aws-lambda';
import { apiFailure, apiSuccess } from './responses';
import { TemplateClient } from '../app/template-client';

export function createHandler({
  templateClient,
}: {
  templateClient: TemplateClient;
}): APIGatewayProxyHandler {
  return async function (event) {
    const { user: userId, clientId } = event.requestContext.authorizer ?? {};

    const templateId = event.pathParameters?.templateId;

    const dto = JSON.parse(event.body || '{}');

    if (!userId || !templateId) {
      return apiFailure(400, 'Invalid request');
    }

    const { data, error } = await templateClient.updateTemplate(
      templateId,
      dto,
      { userId, clientId }
    );

    if (error) {
      return apiFailure(error.code, error.message, error.details);
    }

    return apiSuccess(200, data);
  };
}
