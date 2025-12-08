import type { APIGatewayProxyHandler } from 'aws-lambda';
import type { EmailClient } from 'nhs-notify-web-template-management-utils/email-client';
import { apiFailure, apiSuccess } from '@backend-api/api/responses';
import type { TemplateClient } from '@backend-api/app/template-client';
import { toHeaders } from '@backend-api/utils/headers';

export function createHandler({
  templateClient,
  emailClient,
}: {
  templateClient: TemplateClient;
  emailClient: EmailClient;
}): APIGatewayProxyHandler {
  return async function (event) {
    const { user: userId, clientId } = event.requestContext.authorizer ?? {};

    const templateId = event.pathParameters?.templateId;

    if (!userId || !templateId || !clientId) {
      return apiFailure(400, 'Invalid request');
    }

    const { data, error } = await templateClient.submitTemplate(
      templateId,
      {
        userId,
        clientId,
      },
      toHeaders(event.headers).get('X-Lock-Number') ?? ''
    );

    if (error) {
      return apiFailure(
        error.errorMeta.code,
        error.errorMeta.description,
        error.errorMeta.details
      );
    }

    await emailClient.sendTemplateSubmittedEmailToSuppliers(data);

    return apiSuccess(200, data);
  };
}
