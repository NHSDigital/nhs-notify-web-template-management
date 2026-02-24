import type { APIGatewayProxyHandler } from 'aws-lambda';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { apiFailure, apiSuccess } from '@backend-api/api/responses';
import { LetterVariantClient } from '@backend-api/app/letter-variant-client';

export function createHandler({
  letterVariantClient,
}: {
  letterVariantClient: LetterVariantClient;
}): APIGatewayProxyHandler {
  return async function (event) {
    const { internalUserId, clientId } = event.requestContext.authorizer ?? {};

    const letterVariantId = event.pathParameters?.letterVariantId;

    if (!internalUserId || !letterVariantId || !clientId) {
      return apiFailure(400, 'Invalid request');
    }

    const log = logger.child({
      clientId,
      letterVariantId,
      internalUserId,
    });

    const { data, error } = await letterVariantClient.get(letterVariantId, {
      internalUserId,
      clientId,
    });

    if (error) {
      log
        .child(error.errorMeta)
        .error('Failed to get letter variant', error.actualError);

      return apiFailure(
        error.errorMeta.code,
        error.errorMeta.description,
        error.errorMeta.details
      );
    }

    return apiSuccess(200, data);
  };
}
