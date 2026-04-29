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

    if (!internalUserId || !clientId) {
      return apiFailure(400, 'Invalid request');
    }

    const template = JSON.parse(event.body || '{}');

    const { data: created, error: createTemplateError } =
      await templateClient.uploadDocxTemplate(template, {
        internalUserId,
        clientId,
      });

    if (createTemplateError) {
      return apiFailure(
        createTemplateError.errorMeta.code,
        createTemplateError.errorMeta.description,
        createTemplateError.errorMeta.details
      );
    }

    return apiSuccess(201, created);
  };
}
