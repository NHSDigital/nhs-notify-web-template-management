import type { APIGatewayProxyHandler } from 'aws-lambda';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { apiFailure, noContent } from '@backend-api/api/responses';
import type { RoutingConfigClient } from '@backend-api/app/routing-config-client';
import { toHeaders } from '@backend-api/utils/headers';

export function createHandler({
  routingConfigClient,
}: {
  routingConfigClient: RoutingConfigClient;
}): APIGatewayProxyHandler {
  return async function (event) {
    const { internalUserId, clientId } = event.requestContext.authorizer ?? {};

    const routingConfigId = event.pathParameters?.routingConfigId;

    if (!internalUserId || !routingConfigId || !clientId) {
      return apiFailure(400, 'Invalid request');
    }

    const user = { internalUserId, clientId };
    const log = logger.child(user);

    const { error } = await routingConfigClient.deleteRoutingConfig(
      routingConfigId,
      user,
      toHeaders(event.headers).get('X-Lock-Number') ?? ''
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
