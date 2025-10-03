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

    if (!clientId || !userId) {
      return apiFailure(400, 'Invalid request');
    }

    const payload = JSON.parse(event.body || '{}');

    const user = {
      clientId,
      userId,
    };

    const log = logger.child(user);

    const { data, error } = await routingConfigClient.createRoutingConfig(
      payload,
      user
    );

    if (error) {
      log
        .child(error.errorMeta)
        .error('Failed to create routing configuration', error.actualError);

      return apiFailure(
        error.errorMeta.code,
        error.errorMeta.description,
        error.errorMeta.details
      );
    }

    return apiSuccess(201, data);
  };
}
