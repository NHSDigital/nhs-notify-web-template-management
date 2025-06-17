import { createHandler } from '@backend-api/templates/api/create-letter';
import { mock } from 'jest-mock-extended';
import {
  CreateUpdateTemplate,
  ITemplateClient,
  TemplateDto,
} from 'nhs-notify-backend-client';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import {
  pdfLetterMultipart,
  PdfUploadPartSpec,
} from 'nhs-notify-web-template-management-test-helper-utils';

const setup = () => {
  const templateClient = mock<ITemplateClient>();

  const handler = createHandler({ templateClient });

  return { handler, mocks: { templateClient } };
};

const user = '8B892046';
const now = '2025-03-05T17:42:47.978Z';

describe('create-letter', () => {
  beforeEach(jest.resetAllMocks);

  const initialTemplate: CreateUpdateTemplate = {
    templateType: 'LETTER',
    name: 'template-name',
    clientId: 'client1',
    userId: 'user1',
    letterType: 'x0',
    language: 'en',
  };

  const pdf = Buffer.from('letterPdf');
  const csv = Buffer.from('testCsv');

  const versionId = '2DD85694';

  test('successfully handles multipart form input and forwards PDF and CSV', async () => {
    const { handler, mocks } = setup();

    const pdfFilename = 'template.pdf';
    const csvFilename = 'data.csv';
    const pdfType = 'application/pdf';
    const csvType = 'text/csv';

    const { contentType, multipart } = pdfLetterMultipart(
      [
        { _type: 'json', partName: 'template' },
        {
          _type: 'file',
          partName: 'letterPdf',
          file: pdf,
          fileName: pdfFilename,
          fileType: pdfType,
        },
        {
          _type: 'file',
          partName: 'testCsv',
          file: csv,
          fileName: csvFilename,
          fileType: csvType,
        },
      ],
      initialTemplate
    );

    const event = mock<APIGatewayProxyEvent>({
      body: multipart.toString('base64'),
      headers: {
        'Content-Type': contentType,
      },
      requestContext: { authorizer: { user } },
    });

    const templateId = 'generated-template-id';

    const created: TemplateDto = {
      ...initialTemplate,
      id: templateId,
      createdAt: now,
      updatedAt: now,
      templateStatus: 'PENDING_VALIDATION',
      files: {
        pdfTemplate: {
          fileName: pdfFilename,
          currentVersion: versionId,
          virusScanStatus: 'PENDING',
        },
        testDataCsv: {
          fileName: csvFilename,
          currentVersion: versionId,
          virusScanStatus: 'PENDING',
        },
      },
    };

    mocks.templateClient.createLetterTemplate.mockResolvedValueOnce({
      data: created,
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({ body: expect.any(String), statusCode: 201 });

    expect(JSON.parse((result as APIGatewayProxyResult).body)).toEqual({
      statusCode: 201,
      template: created,
    });

    expect(mocks.templateClient.createLetterTemplate).toHaveBeenCalledWith(
      initialTemplate,
      user,
      new File([pdf], pdfFilename, { type: pdfType }),
      new File([csv], csvFilename, { type: csvType })
    );
  });

  test('successfully handles multipart form input without test data', async () => {
    const { handler, mocks } = setup();

    const pdfFilename = 'template.pdf';
    const pdfType = 'application/pdf';

    const { contentType, multipart } = pdfLetterMultipart(
      [
        { _type: 'json', partName: 'template' },
        {
          _type: 'file',
          partName: 'letterPdf',
          file: pdf,
          fileName: pdfFilename,
          fileType: pdfType,
        },
      ],
      initialTemplate
    );

    const event = mock<APIGatewayProxyEvent>({
      body: multipart.toString('base64'),
      headers: {
        'Content-Type': contentType,
      },
      requestContext: { authorizer: { user } },
    });

    const templateId = 'generated-template-id';

    const created: TemplateDto = {
      ...initialTemplate,
      id: templateId,
      createdAt: now,
      updatedAt: now,
      templateStatus: 'PENDING_VALIDATION',
      files: {
        pdfTemplate: {
          fileName: pdfFilename,
          currentVersion: versionId,
          virusScanStatus: 'PENDING',
        },
      },
    };

    mocks.templateClient.createLetterTemplate.mockResolvedValueOnce({
      data: created,
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({ body: expect.any(String), statusCode: 201 });

    expect(JSON.parse((result as APIGatewayProxyResult).body)).toEqual({
      statusCode: 201,
      template: created,
    });

    expect(mocks.templateClient.createLetterTemplate).toHaveBeenCalledWith(
      initialTemplate,
      user,
      new File([pdf], pdfFilename, { type: pdfType }),
      undefined
    );
  });

  test('returns 400 - Invalid request when no user in requestContext', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { user: undefined } },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        technicalMessage: 'Invalid request',
      }),
    });

    expect(mocks.templateClient.createLetterTemplate).not.toHaveBeenCalled();
  });

  test('returns 400 - Invalid request when no body or Content-Type header', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { user: 'sub' } },
      body: undefined,
      headers: { 'Content-Type': undefined, 'content-type': undefined },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        technicalMessage: 'Unexpected number of form parts in form data: 0',
      }),
    });

    expect(mocks.templateClient.createTemplate).not.toHaveBeenCalled();
  });

  test('returns 400 - Invalid request when template within multipart input cannot be parsed as JSON', async () => {
    const { handler, mocks } = setup();

    const { contentType, multipart } = pdfLetterMultipart(
      [
        { _type: 'json', partName: 'template' },
        {
          _type: 'file',
          partName: 'letterPdf',
          file: pdf,
          fileName: 'template.pdf',
          fileType: 'application/pdf',
        },
      ],
      'not_json'
    );

    const event = mock<APIGatewayProxyEvent>({
      body: multipart.toString('base64'),
      headers: {
        'Content-Type': contentType,
      },
      requestContext: { authorizer: { user } },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        technicalMessage: 'Template is unavailable or cannot be parsed',
      }),
    });

    expect(mocks.templateClient.createTemplate).not.toHaveBeenCalled();
  });

  const invalidMultipartLengthCases: {
    count: number;
    parts: PdfUploadPartSpec[];
  }[] = [
    {
      count: 1,
      parts: [{ _type: 'json', partName: 'a' }],
    },
    {
      count: 4,
      parts: [
        { _type: 'json', partName: 'a' },
        { _type: 'json', partName: 'b' },
        { _type: 'json', partName: 'c' },
        { _type: 'json', partName: 'd' },
      ],
    },
  ];

  test.each(invalidMultipartLengthCases)(
    'returns 400 - Invalid request when multipart input has number of parts ($count) other than two or three',
    async ({ parts, count }) => {
      const { handler } = setup();

      const { multipart, contentType } = pdfLetterMultipart(
        parts,
        initialTemplate
      );
      const event = mock<APIGatewayProxyEvent>({
        body: multipart.toString('base64'),
        headers: {
          'Content-Type': contentType,
        },
        requestContext: { authorizer: { user } },
      });

      const result = await handler(event, mock<Context>(), jest.fn());

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          statusCode: 400,
          technicalMessage: `Unexpected number of form parts in form data: ${count}`,
        }),
      });
    }
  );

  test('should return error when creating template fails', async () => {
    const { handler, mocks } = setup();

    const pdfFilename = 't.pdf';
    const pdfType = 'application/pdf';

    const { contentType, multipart } = pdfLetterMultipart(
      [
        { _type: 'json', partName: 'template' },
        {
          _type: 'file',
          partName: 'letterPdf',
          file: pdf,
          fileName: pdfFilename,
          fileType: pdfType,
        },
      ],
      initialTemplate
    );

    const event = mock<APIGatewayProxyEvent>({
      body: multipart.toString('base64'),
      headers: {
        'Content-Type': contentType,
      },
      requestContext: { authorizer: { user } },
    });

    mocks.templateClient.createLetterTemplate.mockResolvedValueOnce({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        statusCode: 500,
        technicalMessage: 'Internal server error',
      }),
    });

    expect(mocks.templateClient.createLetterTemplate).toHaveBeenCalledWith(
      initialTemplate,
      user,
      new File([pdf], pdfFilename, { type: pdfType }),
      undefined
    );
  });
});
