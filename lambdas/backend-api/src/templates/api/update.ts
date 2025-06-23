import type { APIGatewayProxyHandler } from 'aws-lambda';
import { apiFailure, apiSuccess } from './responses';
import { TemplateClient } from '../app/template-client';

export function createHandler({
  templateClient,
}: {
  templateClient: TemplateClient;
}): APIGatewayProxyHandler {
  return async function (event) {
    const user = event.requestContext.authorizer?.user;

    const templateId = event.pathParameters?.templateId;

    const dto = JSON.parse(event.body || '{}');

    if (!user || !templateId) {
      return apiFailure(400, 'Invalid request');
    }

    const { data, error } = await templateClient.updateTemplate(
      templateId,
      dto,
      user
    );

    if (error) {
      return apiFailure(error.code, error.message, error.details);
    }

    return apiSuccess(200, data);
  };
}
