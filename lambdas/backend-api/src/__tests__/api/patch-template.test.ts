import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';
import { createHandler } from '../../api/patch-template';
import { TemplateClient } from '../../app/template-client';

const setup = () => {
  const templateClient = mock<TemplateClient>();

  const handler = createHandler({ templateClient });

  return { handler, mocks: { templateClient } };
};

describe('Template API - Patch', () => {
  beforeEach(jest.resetAllMocks);

  test.each([
    ['undefined', undefined],
    ['missing user', { clientId: 'client-id', internalUserId: undefined }],
    ['missing client', { clientId: undefined, internalUserId: 'user-1234' }],
  ])(
    'should return 400 - Invalid request when requestContext is %s',
    async (_, ctx) => {
      const { handler, mocks } = setup();

      const event = mock<APIGatewayProxyEvent>({
        requestContext: { authorizer: ctx },
        pathParameters: { templateId: 'id' },
        body: JSON.stringify({ name: 'Updated Name' }),
        headers: {
          'X-Lock-Number': '5',
        },
      });

      const result = await handler(event, mock<Context>(), jest.fn());

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          statusCode: 400,
          technicalMessage: 'Invalid request',
        }),
      });

      expect(
        mocks.templateClient.patchLetterAuthoringTemplate
      ).not.toHaveBeenCalled();
    }
  );

  test('should return 400 - Invalid request when no user in requestContext', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: undefined },
      body: JSON.stringify({ name: 'Updated Name' }),
      pathParameters: { templateId: '1-2-3' },
      headers: {
        'X-Lock-Number': '5',
      },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        technicalMessage: 'Invalid request',
      }),
    });

    expect(
      mocks.templateClient.patchLetterAuthoringTemplate
    ).not.toHaveBeenCalled();
  });

  test('should return 400 - Invalid request when no body', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.patchLetterAuthoringTemplate.mockResolvedValueOnce({
      error: {
        errorMeta: {
          code: 400,
          description: 'Validation failed',
        },
      },
      data: undefined,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
      pathParameters: { templateId: '1-2-3' },
      body: undefined,
      headers: {
        'X-Lock-Number': '5',
      },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        technicalMessage: 'Validation failed',
      }),
    });

    expect(
      mocks.templateClient.patchLetterAuthoringTemplate
    ).toHaveBeenCalledWith(
      '1-2-3',
      {},
      { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' },
      '5'
    );
  });

  test('should return 400 - Invalid request when no templateId', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
      body: JSON.stringify({ name: 'Updated Name' }),
      pathParameters: { templateId: undefined },
      headers: {
        'X-Lock-Number': '5',
      },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        technicalMessage: 'Invalid request',
      }),
    });

    expect(
      mocks.templateClient.patchLetterAuthoringTemplate
    ).not.toHaveBeenCalled();
  });

  test('should return error when patching template fails', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.patchLetterAuthoringTemplate.mockResolvedValueOnce({
      error: {
        errorMeta: {
          code: 500,
          description: 'Internal server error',
        },
      },
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
      body: JSON.stringify({ name: 'Updated Name' }),
      pathParameters: { templateId: '1-2-3' },
      headers: {
        'X-Lock-Number': '5',
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

    expect(
      mocks.templateClient.patchLetterAuthoringTemplate
    ).toHaveBeenCalledWith(
      '1-2-3',
      { name: 'Updated Name' },
      { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' },
      '5'
    );
  });

  test('should return patched template', async () => {
    const { handler, mocks } = setup();

    const updates = {
      name: 'Updated Template Name',
    };
    const response: TemplateDto = {
      id: '1-2-3',
      clientId: 'nhs-notify-client-id',
      name: 'Updated Template Name',
      templateType: 'LETTER',
      templateStatus: 'NOT_YET_SUBMITTED',
      letterType: 'x1',
      language: 'en',
      letterVersion: 'AUTHORING',
      files: {
        initialRender: {
          fileName: 'render.pdf',
          currentVersion: 'v1',
          status: 'RENDERED',
          pageCount: 1,
        },
        docxTemplate: {
          currentVersion: 'version-id',
          fileName: 'template.docx',
          virusScanStatus: 'PENDING',
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lockNumber: 6,
    };

    mocks.templateClient.patchLetterAuthoringTemplate.mockResolvedValueOnce({
      data: response,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
      body: JSON.stringify(updates),
      pathParameters: { templateId: '1-2-3' },
      headers: {
        'X-Lock-Number': '5',
      },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, data: response }),
    });

    expect(
      mocks.templateClient.patchLetterAuthoringTemplate
    ).toHaveBeenCalledWith(
      '1-2-3',
      updates,
      { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' },
      '5'
    );
  });

  test('coerces lock number header to empty string if missing', async () => {
    const { handler, mocks } = setup();

    const updates = {
      name: 'Updated Name',
    };

    mocks.templateClient.patchLetterAuthoringTemplate.mockResolvedValueOnce({
      error: {
        errorMeta: {
          code: 409,
          description:
            'Lock number mismatch - Template has been modified since last read',
        },
      },
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
      body: JSON.stringify(updates),
      pathParameters: { templateId: '1-2-3' },
      headers: {},
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 409,
      body: JSON.stringify({
        statusCode: 409,
        technicalMessage:
          'Lock number mismatch - Template has been modified since last read',
      }),
    });

    expect(
      mocks.templateClient.patchLetterAuthoringTemplate
    ).toHaveBeenCalledWith(
      '1-2-3',
      updates,
      { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' },
      ''
    );
  });
});
