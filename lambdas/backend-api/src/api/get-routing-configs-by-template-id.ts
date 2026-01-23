import type { APIGatewayProxyHandler } from 'aws-lambda';
import { apiFailure, apiSuccess } from './responses';
import { RoutingConfigClient } from '../app/routing-config-client';
import { logger } from 'nhs-notify-web-template-management-utils/logger';

export function createHandler({
  routingConfigClient,
}: {
  routingConfigClient: RoutingConfigClient;
}): APIGatewayProxyHandler {
  return async function (event) {
    const { internalUserId, clientId } = event.requestContext.authorizer ?? {};

    const templateId = event.pathParameters?.templateId;

    if (!internalUserId || !templateId || !clientId) {
      return apiFailure(400, 'Invalid request');
    }

    const log = logger.child({
      clientId,
      templateId,
      internalUserId,
    });

    const { data, error } =
      await routingConfigClient.getRoutingConfigsByTemplateId(
        { internalUserId, clientId },
        templateId
      );

    if (error) {
      log
        .child(error.errorMeta)
        .error(
          'Failed to get routing configs by template ID',
          error.actualError
        );

      return apiFailure(
        error.errorMeta.code,
        error.errorMeta.description,
        error.errorMeta.details
      );
    }

    return apiSuccess(200, data);
  };
}
