import type { APIGatewayProxyHandler } from 'aws-lambda';
import { apiFailure, apiSuccess } from './responses';
import { TemplateClient } from '../app/template-client';
import { EmailClient } from 'nhs-notify-web-template-management-utils/email-client';

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
      event.headers['X-Lock-Number'] ?? ''
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
