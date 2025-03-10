import type { APIGatewayProxyHandler } from 'aws-lambda';
import { apiFailure, apiSuccess } from './responses';
import { CreateTemplate, ITemplateClient } from 'nhs-notify-backend-client';
import { getLetterUploadParts } from '../app/get-letter-upload-parts';

export function createHandler({
  templateClient,
}: {
  templateClient: ITemplateClient;
}): APIGatewayProxyHandler {
  return async function (event) {
    const user = event.requestContext.authorizer?.user;

    if (!user) {
      return apiFailure(400, 'Invalid request');
    }

    const base64body = Buffer.from(event.body ?? '', 'base64');
    const contentType = event.headers['Content-Type'] ?? '';

    const { error: getLetterPartsError, data: letterParts } =
      getLetterUploadParts(base64body, contentType);

    if (getLetterPartsError) {
      return apiFailure(
        getLetterPartsError.code,
        getLetterPartsError.message,
        getLetterPartsError.details
      );
    }

    const { template, pdf, csv } = letterParts;

    const { data: created, error: createTemplateError } =
      await templateClient.createLetterTemplate(
        template as CreateTemplate,
        user,
        pdf,
        csv
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
