import type { APIGatewayProxyHandler } from 'aws-lambda';
import { apiFailure } from './responses';
import { TemplateClient } from '../app/template-client';

export function createHandler({
  templateClient,
}: {
  templateClient: TemplateClient;
}): APIGatewayProxyHandler {
  return async function (event) {
    const { internalUserId, clientId } = event.requestContext.authorizer ?? {};

    if (!internalUserId || !clientId) {
      return apiFailure(400, 'Invalid request');
    }

    const { data, error } = await templateClient.getClientConfiguration({
      internalUserId,
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
      statusCode: 200,
      body: JSON.stringify({ clientConfiguration: data, statusCode: 200 }),
    };
  };
}
