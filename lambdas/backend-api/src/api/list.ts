import type { APIGatewayProxyHandler } from 'aws-lambda';
import { apiFailure, apiSuccess } from './responses';
import { TemplateClient } from '../app/template-client';

type QueryParams = Record<string, string | string[]> | null | undefined;

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

    let params: QueryParams = event.queryStringParameters as QueryParams;

    if (event.multiValueQueryStringParameters) {
      const multiParams = event.multiValueQueryStringParameters;
      const entries = Object.entries(multiParams);

      if (entries.length > 0) {
        params = {};
        for (const [key, values] of entries) {
          if (values) {
            params[key] = values.length === 1 ? values[0] : values;
          }
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
