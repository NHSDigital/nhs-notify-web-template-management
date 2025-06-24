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
    const user = event.requestContext.authorizer?.user;
    const authorizationToken = String(event.headers.Authorization);

    const dto = JSON.parse(event.body || '{}');

    if (!user) {
      return apiFailure(400, 'Invalid request');
    }

    // Note: this feels weird making an API call from another API?
    const client = await ClientConfiguration.fetch(authorizationToken);

    const { data, error } = await templateClient.createTemplate(
      dto,
      user,
      client?.campaignId
    );

    if (error) {
      return apiFailure(error.code, error.message, error.details);
    }

    return apiSuccess(201, data);
  };
}
