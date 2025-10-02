import type { APIGatewayProxyHandler } from 'aws-lambda';
import { apiFailure, apiSuccess } from './responses';
import type { RoutingConfigClient } from '../app/routing-config-client';

export function createHandler({
  routingConfigClient,
}: {
  routingConfigClient: RoutingConfigClient;
}): APIGatewayProxyHandler {
  return async function (event) {
    const { user: userId, clientId } = event.requestContext.authorizer ?? {};

    const routingConfigId = event.pathParameters?.routingConfigId;

    if (!userId || !routingConfigId || !clientId) {
      return apiFailure(400, 'Invalid request');
    }

    const { data, error } = await routingConfigClient.submitRoutingConfig(
      routingConfigId,
      {
        userId,
        clientId,
      }
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
