import type { APIGatewayProxyHandler } from 'aws-lambda';
import { apiFailure, apiSuccess } from './responses';
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

    const { data, error } = await routingConfigClient.submitRoutingConfig(
      routingConfigId,
      user
    );

    if (error) {
      log
        .child(error.errorMeta)
        .error('Failed to submit routing config', error.actualError);

      return apiFailure(
        error.errorMeta.code,
        error.errorMeta.description,
        error.errorMeta.details
      );
    }

    return apiSuccess(200, data);
  };
}
