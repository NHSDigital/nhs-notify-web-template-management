import type { APIGatewayProxyHandler } from 'aws-lambda';
import { apiFailure, apiSuccess } from '@backend-api/api/responses';
import { TemplateClient } from '@backend-api/app/template-client';
import { toHeaders } from '@backend-api/utils/headers';

export function createHandler({
  templateClient,
}: {
  templateClient: TemplateClient;
}): APIGatewayProxyHandler {
  return async function (event) {
    const { user: userId, clientId } = event.requestContext.authorizer ?? {};

    const templateId = event.pathParameters?.templateId;

    if (!userId || !templateId || !clientId) {
      return apiFailure(400, 'Invalid request');
    }

    const { data, error } = await templateClient.requestProof(
      templateId,
      {
        userId,
        clientId,
      },
      toHeaders(event.headers).get('X-Lock-Number') ?? ''
    );

    if (error) {
      return apiFailure(
        error.errorMeta.code,
        error.errorMeta.description,
        error.errorMeta.details
      );
    }

    return apiSuccess(200, data);
  };
}
