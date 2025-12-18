import type { APIGatewayProxyHandler } from 'aws-lambda';
import { apiFailure, apiSuccess } from './responses';
import { TemplateClient } from '../app/template-client';

export function createHandler({
  templateClient,
}: {
  templateClient: TemplateClient;
}): APIGatewayProxyHandler {
  return async function (event) {
    const { internalUserId, clientId } = event.requestContext.authorizer ?? {};

    const dto = JSON.parse(event.body || '{}');

    if (!internalUserId || !clientId) {
      return apiFailure(400, 'Invalid request');
    }

    const { data, error } = await templateClient.createTemplate(dto, {
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

    return apiSuccess(201, data);
  };
}
