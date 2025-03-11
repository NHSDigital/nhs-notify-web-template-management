import { createHandler } from '@backend-api/templates/api/create-letter';
import { mock } from 'jest-mock-extended';
import {
  CreateTemplate,
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

  const initialTemplate: CreateTemplate = {
    templateType: 'LETTER',
    name: 'template-name',
    letterType: 'x0',
    language: 'en',
    files: {
      pdfTemplate: {
        fileName: 'template.pdf',
      },
      testDataCsv: {
        fileName: 'test-data.csv',
      },
    },
  };

  const pdf = new File(['letterPdf'], 'template.pdf', {
    type: 'application/pdf',
  });
  const csv = new File(['testCsv'], 'template.pdf', {
    type: 'text/csv',
  });

  const versionId = '2DD85694';

  test('successfully handles multipart form input and forwards PDF and CSV', async () => {
    const { handler, mocks } = setup();

    const { contentType, multipart } = await pdfLetterMultipart(
      [
        { _type: 'json', partName: 'template' },
        {
          _type: 'file',
          partName: 'letterPdf',
          file: pdf,
          fileName: 'template.pdf',
          fileType: 'application/pdf',
        },
        {
          _type: 'file',
          partName: 'testCsv',
          file: csv,
          fileName: 'test-data.csv',
          fileType: 'text/csv',
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
          fileName: initialTemplate.files.pdfTemplate.fileName,
          currentVersion: versionId,
          virusScanStatus: 'PENDING',
        },
        testDataCsv: {
          fileName: initialTemplate.files.testDataCsv!.fileName,
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
      pdf,
      csv
    );
  });

  test('successfully handles multipart form input without test data', async () => {
    const { handler, mocks } = setup();

    const { contentType, multipart } = await pdfLetterMultipart(
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
          fileName: initialTemplate.files.pdfTemplate.fileName,
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
      pdf,
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
      headers: { 'Content-Type': undefined },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        technicalMessage: 'Invalid request',
      }),
    });

    expect(mocks.templateClient.createTemplate).not.toHaveBeenCalled();
  });

  test('returns 400 - Invalid request when template within multipart input cannot be parsed as JSON', async () => {
    const { handler, mocks } = setup();

    const { contentType, multipart } = await pdfLetterMultipart(
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
        technicalMessage: 'Invalid request',
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
    async ({ parts }) => {
      const { handler } = setup();

      const { multipart, contentType } = await pdfLetterMultipart(
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
          technicalMessage: 'Invalid request',
        }),
      });
    }
  );

  test('should return error when creating template fails', async () => {
    const { handler, mocks } = setup();

    const { contentType, multipart } = await pdfLetterMultipart(
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
      pdf,
      undefined
    );
  });
});
