import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import type { TemplateDto } from 'nhs-notify-web-template-management-types';
import { createHandler } from '../../api/approve-template';
import { TemplateClient } from '../../app/template-client';

const setup = () => {
  const templateClient = mock<TemplateClient>();

  const handler = createHandler({ templateClient });

  return { handler, mocks: { templateClient } };
};

describe('Template API - Approve', () => {
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
        headers: { 'X-Lock-Number': '0' },
      });

      const result = await handler(event, mock<Context>(), jest.fn());

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          statusCode: 400,
          technicalMessage: 'Invalid request',
        }),
      });

      expect(mocks.templateClient.approveTemplate).not.toHaveBeenCalled();
    }
  );

  test('should return 400 - Invalid request when, no templateId', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
      pathParameters: { templateId: undefined },
      headers: { 'X-Lock-Number': '0' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        technicalMessage: 'Invalid request',
      }),
    });

    expect(mocks.templateClient.approveTemplate).not.toHaveBeenCalled();
  });

  test('should return error when approving template fails', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.approveTemplate.mockResolvedValueOnce({
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
      pathParameters: { templateId: '1-2-3' },
      headers: { 'X-Lock-Number': '0' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        statusCode: 500,
        technicalMessage: 'Internal server error',
      }),
    });

    expect(mocks.templateClient.approveTemplate).toHaveBeenCalledWith(
      '1-2-3',
      {
        internalUserId: 'user-1234',
        clientId: 'nhs-notify-client-id',
      },
      '0'
    );
  });

  test('should return error with details when approving template fails with details', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.approveTemplate.mockResolvedValueOnce({
      error: {
        errorMeta: {
          code: 400,
          description: 'Template cannot be approved',
          details: { reason: 'not a letter' },
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
      pathParameters: { templateId: '1-2-3' },
      headers: { 'X-Lock-Number': '1' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        technicalMessage: 'Template cannot be approved',
        details: { reason: 'not a letter' },
      }),
    });
  });

  test('should coerce missing lock number header to empty string', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.approveTemplate.mockResolvedValueOnce({
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

    expect(mocks.templateClient.approveTemplate).toHaveBeenCalledWith(
      '1-2-3',
      {
        internalUserId: 'user-1234',
        clientId: 'nhs-notify-client-id',
      },
      ''
    );
  });

  test('should return template on success', async () => {
    const { handler, mocks } = setup();

    const response: TemplateDto = {
      id: '1-2-3',
      clientId: 'clientid',
      name: 'approved-template',
      templateStatus: 'PROOF_APPROVED',
      templateType: 'LETTER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lockNumber: 1,
      language: 'en',
      letterType: 'x0',
      letterVersion: 'AUTHORING',
      letterVariantId: 'var1',
      files: {
        docxTemplate: {
          fileName: 'template.docx',
          currentVersion: 'v1',
          virusScanStatus: 'PASSED',
        },
        initialRender: {
          status: 'RENDERED',
          fileName: 'render.pdf',
          currentVersion: 'v1',
          pageCount: 2,
        },
        shortFormRender: {
          status: 'RENDERED',
          fileName: 'render1.pdf',
          currentVersion: 'v1',
          pageCount: 2,
        },
        longFormRender: {
          status: 'RENDERED',
          fileName: 'render2.pdf',
          currentVersion: 'v1',
          pageCount: 2,
        },
      },
    };

    mocks.templateClient.approveTemplate.mockResolvedValueOnce({
      data: response,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
      pathParameters: { templateId: '1-2-3' },
      headers: { 'X-Lock-Number': '0' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, data: response }),
    });

    expect(mocks.templateClient.approveTemplate).toHaveBeenCalledWith(
      '1-2-3',
      {
        internalUserId: 'user-1234',
        clientId: 'nhs-notify-client-id',
      },
      '0'
    );
  });
});
