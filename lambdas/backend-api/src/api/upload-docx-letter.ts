import type { APIGatewayProxyHandler } from 'aws-lambda';
import { apiFailure, apiSuccess } from './responses';
import { getDocxUploadParts } from '../app/get-letter-upload-parts';
import { TemplateClient } from '../app/template-client';

export function createHandler({
  templateClient,
}: {
  templateClient: TemplateClient;
}): APIGatewayProxyHandler {
  return async function (event) {
    const { internalUserId, clientId } = event.requestContext.authorizer ?? {};

    if (!internalUserId || !clientId) {
      return apiFailure(400, 'Invalid request');
    }

    const base64body = Buffer.from(event.body ?? '', 'base64');

    const contentType =
      event.headers['Content-Type'] ?? event.headers['content-type'] ?? 'none';

    const { error: getLetterPartsError, data: letterParts } =
      getDocxUploadParts(base64body, contentType);

    if (getLetterPartsError) {
      return apiFailure(400, getLetterPartsError.errorMeta.description);
    }

    const { template, docxTemplate } = letterParts;

    const { data: created, error: createTemplateError } =
      await templateClient.uploadDocxTemplate(
        template,
        { internalUserId, clientId },
        docxTemplate
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
