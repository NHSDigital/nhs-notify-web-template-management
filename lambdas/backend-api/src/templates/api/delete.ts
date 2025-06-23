import type { APIGatewayProxyHandler } from 'aws-lambda';
import { apiFailure } from './responses';
import { TemplateClient } from '../app/template-client';

export function createHandler({
  templateClient,
}: {
  templateClient: TemplateClient;
}): APIGatewayProxyHandler {
  return async function (event) {
    const user = event.requestContext.authorizer?.user;

    const templateId = event.pathParameters?.templateId;

    if (!user || !templateId) {
      return apiFailure(400, 'Invalid request');
    }

    const { error } = await templateClient.deleteTemplate(templateId, user);

    if (error) {
      return apiFailure(error.code, error.message, error.details);
    }

    return {
      statusCode: 204,
      body: JSON.stringify({
        statusCode: 204,
      }),
    };
  };
}
