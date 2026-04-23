import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import { createHandler } from '../../api/generate-letter-proof';
import { TemplateClient } from '../../app/template-client';
import type { AuthoringLetterTemplate } from 'nhs-notify-web-template-management-utils';

const setup = () => {
  const templateClient = mock<TemplateClient>();

  const handler = createHandler({ templateClient });

  return { handler, mocks: { templateClient } };
};

describe('Template API - generate letter proof', () => {
  beforeEach(jest.resetAllMocks);

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
        pathParameters: { templateId: 'id' },
        headers: { 'X-Lock-Number': '0' },
        body: JSON.stringify({ personalisation: {} }),
      });

      const result = await handler(event, mock<Context>(), jest.fn());

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          statusCode: 400,
          technicalMessage: 'Invalid request',
        }),
      });

      expect(mocks.templateClient.generateLetterProof).not.toHaveBeenCalled();
    }
  );

  test('should return 400 - Invalid request when no templateId', async () => {
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
      body: JSON.stringify({ personalisation: {} }),
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        technicalMessage: 'Invalid request',
      }),
    });

    expect(mocks.templateClient.generateLetterProof).not.toHaveBeenCalled();
  });

  test('should return error when letter proof fails', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.generateLetterProof.mockResolvedValueOnce({
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
      pathParameters: { templateId: 'template-id' },
      headers: { 'X-Lock-Number': '0' },
      body: JSON.stringify({
        personalisation: { name: 'Test' },
        requestTypeVariant: 'proof',
        systemPersonalisationPackId: 'pack-id',
      }),
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        statusCode: 500,
        technicalMessage: 'Internal server error',
      }),
    });

    expect(mocks.templateClient.generateLetterProof).toHaveBeenCalledWith(
      'template-id',
      { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' },
      '0',
      {
        personalisation: { name: 'Test' },
        requestTypeVariant: 'proof',
        systemPersonalisationPackId: 'pack-id',
      }
    );
  });

  test('should coerce missing lock number header to empty string', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.generateLetterProof.mockResolvedValueOnce({
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
      pathParameters: { templateId: 'template-id' },
      headers: {},
      body: JSON.stringify({ personalisation: {} }),
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

    expect(mocks.templateClient.generateLetterProof).toHaveBeenCalledWith(
      'template-id',
      { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' },
      '',
      { personalisation: {} }
    );
  });

  test('should coerce missing body to empty object', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.generateLetterProof.mockResolvedValueOnce({
      error: {
        errorMeta: {
          code: 400,
          description: 'Invalid letter proof request',
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
      pathParameters: { templateId: 'template-id' },
      headers: { 'X-Lock-Number': '1' },
      body: null,
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        technicalMessage: 'Invalid letter proof request',
      }),
    });

    expect(mocks.templateClient.generateLetterProof).toHaveBeenCalledWith(
      'template-id',
      { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' },
      '1',
      {}
    );
  });

  test('should return template with 201 status on success', async () => {
    const { handler, mocks } = setup();

    const response: AuthoringLetterTemplate = {
      id: 'id',
      campaignId: 'campaign',
      clientId: 'client-id',
      templateType: 'LETTER',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'template-name',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
      lockNumber: 2,
      letterType: 'x0',
      language: 'en',
      letterVersion: 'AUTHORING',
      files: {
        docxTemplate: {
          fileName: 'template.docx',
          currentVersion: '61C1267A-0F37-4E1D-831E-494DE2BECC8C',
          virusScanStatus: 'PASSED',
        },
        initialRender: {
          status: 'RENDERED',
          currentVersion: 'version-1',
          fileName: 'render.pdf',
          pageCount: 2,
        },
        shortFormRender: {
          status: 'PENDING',
          requestedAt: '2025-01-13T10:19:35.579Z',
          personalisationParameters: { name: 'Test' },
          systemPersonalisationPackId: 'pack-id',
        },
      },
    };

    mocks.templateClient.generateLetterProof.mockResolvedValueOnce({
      data: response,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'notify-client-id',
        },
      },
      pathParameters: { templateId: 'id' },
      headers: { 'X-Lock-Number': '1' },
      body: JSON.stringify({
        personalisation: { name: 'Test' },
        requestTypeVariant: 'proof',
        systemPersonalisationPackId: 'pack-id',
      }),
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 201,
      body: JSON.stringify({ statusCode: 201, data: response }),
    });

    expect(mocks.templateClient.generateLetterProof).toHaveBeenCalledWith(
      'id',
      {
        internalUserId: 'user-1234',
        clientId: 'notify-client-id',
      },
      '1',
      {
        personalisation: { name: 'Test' },
        requestTypeVariant: 'proof',
        systemPersonalisationPackId: 'pack-id',
      }
    );
  });
});
