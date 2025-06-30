import type { APIGatewayProxyHandler } from 'aws-lambda';
import { apiFailure, apiSuccess } from './responses';
import {
  ClientConfiguration,
  type CreateUpdateTemplate,
} from 'nhs-notify-backend-client';
import { getLetterUploadParts } from '../app/get-letter-upload-parts';
import { TemplateClient } from '../app/template-client';

export function createHandler({
  templateClient,
}: {
  templateClient: TemplateClient;
}): APIGatewayProxyHandler {
  return async function (event) {
    const { user: userId, clientId } = event.requestContext.authorizer ?? {};
    const authorizationToken = String(event.headers.Authorization);

    if (!userId) {
      return apiFailure(400, 'Invalid request');
    }

    const base64body = Buffer.from(event.body ?? '', 'base64');

    const contentType =
      event.headers['Content-Type'] ?? event.headers['content-type'] ?? 'none';

    const { error: getLetterPartsError, data: letterParts } =
      getLetterUploadParts(base64body, contentType);

    if (getLetterPartsError) {
      return apiFailure(400, getLetterPartsError.message);
    }

    const client = await ClientConfiguration.fetch(authorizationToken);

    const { template, pdf, csv } = letterParts;

    const { data: created, error: createTemplateError } =
      await templateClient.createLetterTemplate(
        template as CreateUpdateTemplate,
        { userId, clientId },
        pdf,
        csv,
        client?.campaignId
      );

    if (createTemplateError) {
      return apiFailure(
        createTemplateError.code,
        createTemplateError.message,
        createTemplateError.details
      );
    }

    return apiSuccess(201, created);
  };
}
