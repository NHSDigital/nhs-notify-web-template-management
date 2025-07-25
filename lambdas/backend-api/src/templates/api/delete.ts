import type { APIGatewayProxyHandler } from 'aws-lambda';
import { apiFailure } from './responses';
import { TemplateClient } from '../app/template-client';

export function createHandler({
  templateClient,
}: {
  templateClient: TemplateClient;
}): APIGatewayProxyHandler {
  return async function (event) {
    const { user: userId, clientId } = event.requestContext.authorizer ?? {};

    const templateId = event.pathParameters?.templateId;

    if (!userId || !templateId) {
      return apiFailure(400, 'Invalid request');
    }

    const { error } = await templateClient.deleteTemplate(templateId, {
      userId,
      clientId,
    });

    if (error) {
      return apiFailure(
        error.errorMeta.code,
        error.errorMeta.description,
        error.errorMeta.details
      );
    }

    return {
      statusCode: 204,
      body: JSON.stringify({
        statusCode: 204,
      }),
    };
  };
}
