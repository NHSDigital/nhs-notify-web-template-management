import type { APIGatewayProxyHandler } from 'aws-lambda';
import { apiFailure, noContent } from './responses';
import type { RoutingConfigClient } from '../app/routing-config-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';

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

    const user = { userId, clientId };
    const log = logger.child(user);

    const { error } = await routingConfigClient.deleteRoutingConfig(
      routingConfigId,
      user,
      event.headers['X-Lock-Number'] ?? ''
    );

    if (error) {
      log
        .child(error.errorMeta)
        .error('Failed to delete routing config', error.actualError);

      return apiFailure(
        error.errorMeta.code,
        error.errorMeta.description,
        error.errorMeta.details
      );
    }

    return noContent;
  };
}
