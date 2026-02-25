import { createHandler } from '../../api/upload-docx-letter';
import { mock } from 'jest-mock-extended';
import { CreateUpdateTemplate, TemplateDto } from 'nhs-notify-backend-client';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import {
  getTestMultipartFormData,
  UploadPartSpec,
} from 'nhs-notify-web-template-management-test-helper-utils';
import { TemplateClient } from '../../app/template-client';

const setup = () => {
  const templateClient = mock<TemplateClient>();

  const handler = createHandler({ templateClient });

  return { handler, mocks: { templateClient } };
};

const internalUserId = '8B892046';
const clientId = 'A6C062FBAEBC';
const now = '2025-03-05T17:42:47.978Z';

describe('upload-docx-letter', () => {
  beforeEach(jest.resetAllMocks);

  const initialTemplate: CreateUpdateTemplate = {
    templateType: 'LETTER',
    name: 'template-name',
    letterType: 'x0',
    language: 'en',
    campaignId: 'campaign-id',
    letterVersion: 'AUTHORING',
  };

  const docx = Buffer.from('docx');

  const versionId = '2DD85694';

  test('successfully handles multipart form input and forwards docx', async () => {
    const { handler, mocks } = setup();

    const docxFilename = 'template.pdf';
    const docxContentType =
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    const { contentType, multipart } = getTestMultipartFormData(
      [
        { _type: 'json', partName: 'template' },
        {
          _type: 'file',
          partName: 'docxTemplate',
          file: docx,
          fileName: docxFilename,
          fileType: docxContentType,
        },
      ],
      initialTemplate
    );

    const event = mock<APIGatewayProxyEvent>({
      body: multipart.toString('base64'),
      headers: {
        'Content-Type': contentType,
        Authorization: 'example',
      },
      requestContext: { authorizer: { internalUserId, clientId } },
    });

    const templateId = 'generated-template-id';

    const created: TemplateDto = {
      ...initialTemplate,
      id: templateId,
      createdAt: now,
      updatedAt: now,
      lockNumber: 1,
      templateStatus: 'PENDING_VALIDATION',
      letterVersion: 'AUTHORING',
      files: {
        docxTemplate: {
          fileName: docxFilename,
          currentVersion: versionId,
          virusScanStatus: 'PENDING',
        },
      },
    };

    mocks.templateClient.uploadDocxTemplate.mockResolvedValueOnce({
      data: created,
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({ body: expect.any(String), statusCode: 201 });

    expect(JSON.parse((result as APIGatewayProxyResult).body)).toEqual({
      statusCode: 201,
      data: created,
    });

    expect(mocks.templateClient.uploadDocxTemplate).toHaveBeenCalledWith(
      initialTemplate,
      { internalUserId, clientId },
      expect.any(File)
    );

    const [_1, _2, actualDocx] =
      mocks.templateClient.uploadDocxTemplate.mock.calls[0];

    expect(actualDocx).toEqual(
      new File([docx], docxFilename, {
        type: docxContentType,
        lastModified: actualDocx.lastModified,
      })
    );
  });

  test.each([
    ['undefined', undefined],
    ['missing clientId', { internalUserId: 'user-id', clientId: undefined }],
    ['missing user', { clientId: 'client-id', internalUserId: undefined }],
  ])(
    'should return 400 - Invalid request when requestContext is %s',
    async (_, ctx) => {
      const { handler, mocks } = setup();

      const event = mock<APIGatewayProxyEvent>({
        requestContext: { authorizer: ctx },
      });

      const result = await handler(event, mock<Context>(), jest.fn());

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          statusCode: 400,
          technicalMessage: 'Invalid request',
        }),
      });

      expect(mocks.templateClient.uploadDocxTemplate).not.toHaveBeenCalled();
    }
  );

  test('returns 400 - Invalid request when no body or Content-Type header', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { internalUserId: 'user-1234', clientId } },
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

    const { contentType, multipart } = getTestMultipartFormData(
      [
        { _type: 'json', partName: 'template' },
        {
          _type: 'file',
          partName: 'docxTemplate',
          file: docx,
          fileName: 'template.docx',
          fileType:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      ],
      'not_json'
    );

    const event = mock<APIGatewayProxyEvent>({
      body: multipart.toString('base64'),
      headers: {
        'Content-Type': contentType,
      },
      requestContext: { authorizer: { internalUserId, clientId } },
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
    parts: UploadPartSpec[];
  }[] = [
    {
      count: 1,
      parts: [{ _type: 'json', partName: 'a' }],
    },
    {
      count: 3,
      parts: [
        { _type: 'json', partName: 'a' },
        { _type: 'json', partName: 'b' },
        { _type: 'json', partName: 'c' },
      ],
    },
  ];

  test.each(invalidMultipartLengthCases)(
    'returns 400 - Invalid request when multipart input has number of parts ($count) other than two',
    async ({ parts, count }) => {
      const { handler } = setup();

      const { multipart, contentType } = getTestMultipartFormData(
        parts,
        initialTemplate
      );
      const event = mock<APIGatewayProxyEvent>({
        body: multipart.toString('base64'),
        headers: {
          'Content-Type': contentType,
        },
        requestContext: { authorizer: { internalUserId, clientId } },
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

    const docxFilename = 't.docx';
    const docxType =
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    const { contentType, multipart } = getTestMultipartFormData(
      [
        { _type: 'json', partName: 'template' },
        {
          _type: 'file',
          partName: 'docxTemplate',
          file: docx,
          fileName: docxFilename,
          fileType: docxType,
        },
      ],
      initialTemplate
    );

    const event = mock<APIGatewayProxyEvent>({
      body: multipart.toString('base64'),
      headers: {
        'Content-Type': contentType,
      },
      requestContext: { authorizer: { internalUserId, clientId } },
    });

    mocks.templateClient.uploadDocxTemplate.mockResolvedValueOnce({
      error: {
        errorMeta: {
          code: 500,
          description: 'Internal server error',
        },
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

    expect(mocks.templateClient.uploadDocxTemplate).toHaveBeenCalledWith(
      initialTemplate,
      { internalUserId, clientId },
      expect.any(File)
    );

    const actualDocx = mocks.templateClient.uploadDocxTemplate.mock.calls[0][2];

    expect(actualDocx).toEqual(
      new File([docx], docxFilename, {
        type: docxType,
        lastModified: actualDocx.lastModified,
      })
    );
  });
});
