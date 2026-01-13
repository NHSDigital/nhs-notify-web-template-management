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

    let params: Record<string, string | string[]> | null =
      event.queryStringParameters;

    if (event.multiValueQueryStringParameters) {
      const multiParams = event.multiValueQueryStringParameters;
      const keys = Object.keys(multiParams);

      if (keys.length > 0) {
        params = {};
        for (const key of keys) {
          const values = multiParams[key];
          params[key] = values.length === 1 ? values[0] : values;
        }
      }
    }

    const { data, error } = await templateClient.listTemplates(
      {
        internalUserId,
        clientId,
      },
      params
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
