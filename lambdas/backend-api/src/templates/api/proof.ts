import type { APIGatewayProxyHandler } from 'aws-lambda';
import { apiFailure, apiSuccess } from './responses';
import { ClientConfiguration } from 'nhs-notify-backend-client';
import { TemplateClient } from '../app/template-client';

export function createHandler({
  templateClient,
}: {
  templateClient: TemplateClient;
}): APIGatewayProxyHandler {
  return async function (event) {
    const authorizationToken = String(event.headers.Authorization);
    const user = event.requestContext.authorizer?.user;
    const templateId = event.pathParameters?.templateId;

    if (!user || !templateId) {
      return apiFailure(400, 'Invalid request');
    }

    const client = await ClientConfiguration.fetch(authorizationToken);

    const proofingEnabled = client?.featureEnabled('proofing') || false;

    const { data, error } = await templateClient.requestProof(
      templateId,
      user,
      proofingEnabled
    );

    if (error) {
      return apiFailure(error.code, error.message, error.details);
    }

    return apiSuccess(200, data);
  };
}
