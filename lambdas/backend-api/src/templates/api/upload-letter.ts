import type { APIGatewayProxyHandler } from 'aws-lambda';
import { apiFailure, apiSuccess } from './responses';
import { getLetterUploadParts } from '../app/get-letter-upload-parts';
import { TemplateClient } from '../app/template-client';

export function createHandler({
  templateClient,
}: {
  templateClient: TemplateClient;
}): APIGatewayProxyHandler {
  return async function (event) {
    const { user: userId, clientId } = event.requestContext.authorizer ?? {};

    if (!userId || !clientId) {
      return apiFailure(400, 'Invalid request');
    }

    const base64body = Buffer.from(event.body ?? '', 'base64');

    const contentType =
      event.headers['Content-Type'] ?? event.headers['content-type'] ?? 'none';

    const { error: getLetterPartsError, data: letterParts } =
      getLetterUploadParts(base64body, contentType);

    if (getLetterPartsError) {
      return apiFailure(400, getLetterPartsError.errorMeta.description);
    }

    const { template, pdf, csv } = letterParts;

    const { data: created, error: createTemplateError } =
      await templateClient.uploadLetterTemplate(
        template,
        { userId, clientId },
        pdf,
        csv
      );

    if (createTemplateError) {
      return apiFailure(
        createTemplateError.errorMeta.code,
        createTemplateError.errorMeta.description,
        createTemplateError.errorMeta.details
      );
    }

    return apiSuccess(201, created);
  };
}
