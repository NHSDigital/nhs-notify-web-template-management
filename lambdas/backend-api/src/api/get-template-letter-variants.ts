import type { APIGatewayProxyHandler } from 'aws-lambda';
import { logger } from 'nhs-notify-web-template-management-utils/logger';
import { apiFailure, apiSuccess } from '@backend-api/api/responses';
import type { TemplateClient } from '@backend-api/app/template-client';

export function createHandler({
  templateClient,
}: {
  templateClient: TemplateClient;
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

    const { data, error } = await templateClient.getLetterVariantsForTemplate(
      templateId,
      { internalUserId, clientId }
    );

    if (error) {
      log
        .child(error.errorMeta)
        .error('Failed to get letter variants for template', error.actualError);

      return apiFailure(
        error.errorMeta.code,
        error.errorMeta.description,
        error.errorMeta.details
      );
    }

    return apiSuccess(200, data);
  };
}
