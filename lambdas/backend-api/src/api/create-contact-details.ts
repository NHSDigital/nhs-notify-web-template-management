import type { APIGatewayProxyHandler } from 'aws-lambda';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import type { ContactDetailsClient } from '@backend-api/app/contact-details-client';
import { apiFailure, apiSuccess } from '@backend-api/api/responses';

type Dependencies = {
  contactDetailsClient: ContactDetailsClient;
};

export function createHandler({
  contactDetailsClient,
}: Dependencies): APIGatewayProxyHandler {
  return async function handler(event) {
    const { internalUserId, clientId } = event.requestContext.authorizer ?? {};

    if (!clientId || !internalUserId) {
      return apiFailure(400, 'Invalid request');
    }

    const payload = JSON.parse(event.body || '{}');

    const user = {
      clientId,
      internalUserId,
    };

    const log = logger.child(user);

    const { data, error } = await contactDetailsClient.putContactDetail(
      payload,
      user
    );

    if (error) {
      log
        .child(error.errorMeta)
        .error('Failed to save contact details', error.actualError);

      return apiFailure(
        error.errorMeta.code,
        error.errorMeta.description,
        error.errorMeta.details
      );
    }

    return apiSuccess(201, data);
  };
}
