import type { APIGatewayProxyHandler } from 'aws-lambda';
import { apiFailure, apiSuccess } from './responses';
import type { RoutingConfigClient } from '../app/routing-config-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';

export function createHandler({
  routingConfigClient,
}: {
  routingConfigClient: RoutingConfigClient;
}): APIGatewayProxyHandler {
  return async function handler(event) {
    const { user: userId, clientId } = event.requestContext.authorizer ?? {};

    const routingConfigId = event.pathParameters?.routingConfigId;

    if (!routingConfigId || !clientId || !userId) {
      return apiFailure(400, 'Invalid request');
    }

    const log = logger.child({
      clientId,
      routingConfigId,
      userId,
    });

    const { data, error } = await routingConfigClient.getRoutingConfig(
      routingConfigId,
      { clientId, userId }
    );

    if (error) {
      log
        .child(error.errorMeta)
        .error('Failed to get routing config', error.actualError);

      return apiFailure(
        error.errorMeta.code,
        error.errorMeta.description,
        error.errorMeta.details
      );
    }

    return apiSuccess(200, data);
  };
}
