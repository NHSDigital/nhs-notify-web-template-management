import type {
  APIGatewayProxyHandler,
  APIGatewayProxyEventMultiValueQueryStringParameters,
} from 'aws-lambda';
import { apiFailure, apiSuccess } from './responses';
import { TemplateClient } from '../app/template-client';

type QueryParams = Record<string, string | string[]> | null | undefined;

function convertMultiValueParams(
  multiParams: APIGatewayProxyEventMultiValueQueryStringParameters
): QueryParams {
  const entries = Object.entries(multiParams);
  if (entries.length === 0) return null;

  const params: NonNullable<QueryParams> = {};
  for (const [key, values] of entries) {
    if (values) {
      params[key] = values;
    }
  }
  return params;
}

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

    const params = event.multiValueQueryStringParameters
      ? convertMultiValueParams(event.multiValueQueryStringParameters)
      : event.queryStringParameters;

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
