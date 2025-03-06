import type { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { apiFailure, apiSuccess } from '../responses';
import * as multipart from 'parse-multipart-data';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ApplicationResult, failure, success } from '@backend-api/utils/result';
import {
  $CreateLetterTemplateSchema,
  ErrorCase,
  ITemplateClient,
} from 'nhs-notify-backend-client';
import z from 'zod';

const parts = {
  TEMPLATE: {
    name: 'template',
  },
  PDF: {
    name: 'letterPdf',
    fileType: 'application/pdf',
  },
  CSV: {
    name: 'testCsv',
    fileType: 'text/csv',
  },
};

type FormParts = ReturnType<typeof multipart.parse>;

export type CreateLetter = z.infer<typeof $CreateLetterTemplateSchema>;

function parseData(event: APIGatewayProxyEvent): ApplicationResult<FormParts> {
  try {
    const bodyBuffer = Buffer.from(event.body || '', 'base64');

    const boundary = multipart.getBoundary(event.headers['Content-Type'] || '');

    return success(multipart.parse(bodyBuffer, boundary));
  } catch (error) {
    return failure(ErrorCase.VALIDATION_FAILED, 'Failed to parse body', error);
  }
}

function parseTemplate(formParts: FormParts): ApplicationResult<CreateLetter> {
  const templateDataStr = formParts
    .find((part) => part.name === parts.TEMPLATE.name)
    ?.data.toString();

  if (!templateDataStr) {
    return failure(ErrorCase.VALIDATION_FAILED, `Template data not found`);
  }

  try {
    return success(
      $CreateLetterTemplateSchema.parse(JSON.parse(templateDataStr))
    );
  } catch (error) {
    return failure(
      ErrorCase.VALIDATION_FAILED,
      'Failed to pase template',
      error
    );
  }
}

export function createHandler({
  s3Client,
  templateClient,
  generateSuffixId,
  quarantineBucketName,
}: {
  s3Client: S3Client;
  templateClient: ITemplateClient;
  generateSuffixId: () => string;
  quarantineBucketName: string;
}): APIGatewayProxyHandler {
  return async function (event) {
    const user = event.requestContext.authorizer?.user;

    if (!user) {
      return apiFailure(400, 'Invalid request');
    }

    const formParts = parseData(event);

    if (!formParts.data) {
      return apiFailure(
        formParts.error.code,
        formParts.error.message,
        formParts.error.actualError
      );
    }

    if (formParts.data.length < 2 || formParts.data.length > 3) {
      return apiFailure(
        ErrorCase.VALIDATION_FAILED,
        `Unexpected number of formParts in form data: ${formParts.data.length}`
      );
    }

    const template = parseTemplate(formParts.data);

    if (!template.data) {
      return apiFailure(
        template.error.code,
        template.error.message,
        template.error.actualError
      );
    }

    const testDataFilename = template.data.testPersonalisationInputFile;

    const pdfPart = formParts.data.find((part) => part.name === parts.PDF.name);

    if (!pdfPart || pdfPart.type !== parts.PDF.fileType || !pdfPart.filename) {
      return apiFailure(ErrorCase.VALIDATION_FAILED, 'Failed to find PDF data');
    }

    const idSuffix = generateSuffixId();

    const commands: PutObjectCommand[] = [];

    const csvPart = formParts.data.find((part) => part.name === parts.CSV.name);

    if (
      testDataFilename &&
      (!csvPart || csvPart?.type !== parts.CSV.fileType || !csvPart.filename)
    ) {
      return apiFailure(
        ErrorCase.VALIDATION_FAILED,
        'Failed to find CSV test data'
      );
    }

    const csvMinusExt = csvPart?.filename?.replace(/\.csv$/i, '');
    const finalCsvFilename = `${csvMinusExt}__${idSuffix}.csv`;
    const csvKey = `test-data/${user}/${finalCsvFilename}`;

    if (testDataFilename) {
      if (csvPart?.type !== parts.CSV.fileType || !csvPart.filename) {
        return apiFailure(
          ErrorCase.VALIDATION_FAILED,
          'Failed to find CSV test data'
        );
      } else {
        commands.push(
          new PutObjectCommand({
            Bucket: quarantineBucketName,
            Key: csvKey,
            Body: csvPart.data,
          })
        );
      }
    }

    const pdfMinusExt = pdfPart.filename.replace(/\.pdf$/i, '');
    const pdfKey = `pdf-template/${user}/${pdfMinusExt}__${idSuffix}.pdf`;

    commands.push(
      new PutObjectCommand({
        Bucket: quarantineBucketName,
        Key: pdfKey,
        Body: pdfPart.data,
        ...(testDataFilename && {
          Metadata: { 'test-data-csv': finalCsvFilename },
        }),
      })
    );

    const { data: createTemplateResponse, error: createTemplateError } =
      await templateClient.createTemplate(template.data, user);

    if (createTemplateError) {
      return apiFailure(
        createTemplateError.code,
        createTemplateError.message,
        createTemplateError.details
      );
    }

    try {
      await Promise.all(commands.map((cmd) => s3Client.send(cmd)));
    } catch (error) {
      try {
        await templateClient.deleteTemplate(createTemplateResponse.id, user);
      } catch {
        return apiFailure(500, `Failed to upload`, error);
      }

      return apiFailure(500, `Failed to upload`, error);
    }

    return apiSuccess(201, createTemplateResponse);
  };
}
