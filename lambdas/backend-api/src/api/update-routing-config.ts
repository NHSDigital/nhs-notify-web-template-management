import type { APIGatewayProxyHandler } from 'aws-lambda';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { apiFailure, apiSuccess } from '@backend-api/api/responses';
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

    if (!routingConfigId || !internalUserId || !clientId) {
      return apiFailure(400, 'Invalid request');
    }

    const payload = JSON.parse(event.body || '{}');

    const log = logger.child({
      clientId,
      routingConfigId,
      internalUserId,
    });

    const { data, error } = await routingConfigClient.updateRoutingConfig(
      routingConfigId,
      payload,
      { internalUserId, clientId },
      toHeaders(event.headers).get('X-Lock-Number') ?? ''
    );

    if (error) {
      log
        .child(error.errorMeta)
        .error('Failed to update routing config', error.actualError);

      return apiFailure(
        error.errorMeta.code,
        error.errorMeta.description,
        error.errorMeta.details
      );
    }

    return apiSuccess(200, data);
  };
}
