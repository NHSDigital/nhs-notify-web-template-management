import type { APIGatewayProxyHandler } from 'aws-lambda';
import { apiFailure, apiSuccess } from './responses';
import { ITemplateClient } from 'nhs-notify-backend-client';

export function createHandler({
  templateClient,
}: {
  templateClient: ITemplateClient;
}): APIGatewayProxyHandler {
  return async function (event) {
    const user = event.requestContext.authorizer?.user;

    const templateId = event.pathParameters?.templateId;

    if (!user || !templateId) {
      return apiFailure(400, 'Invalid request');
    }

    const { data, error } = await templateClient.requestProof(templateId, user);

    if (error) {
      return apiFailure(error.code, error.message, error.details);
    }

    return apiSuccess(200, data);
  };
}
