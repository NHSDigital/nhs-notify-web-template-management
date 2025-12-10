import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock, mockDeep } from 'jest-mock-extended';
import { TemplateDto } from 'nhs-notify-backend-client';
import { createHandler } from '../../api/submit';
import { EmailClient } from 'nhs-notify-web-template-management-utils/email-client';
import { TemplateClient } from '../../app/template-client';

const setup = () => {
  const templateClient = mock<TemplateClient>();
  const emailClient = mockDeep<EmailClient>();

  const handler = createHandler({ templateClient, emailClient });

  return { handler, mocks: { templateClient } };
};

describe('Template API - Submit', () => {
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

      expect(mocks.templateClient.submitTemplate).not.toHaveBeenCalled();
    }
  );

  test('should return 400 - Invalid request when, no templateId', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' },
      },
      body: JSON.stringify({ name: 'test' }),
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

    expect(mocks.templateClient.submitTemplate).not.toHaveBeenCalled();
  });

  test('should return error when submitting template fails', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.submitTemplate.mockResolvedValueOnce({
      error: {
        errorMeta: {
          code: 500,
          description: 'Internal server error',
        },
      },
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' },
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

    expect(mocks.templateClient.submitTemplate).toHaveBeenCalledWith(
      '1-2-3',
      {
        internalUserId: 'user-1234',
        clientId: 'nhs-notify-client-id',
      },
      '0'
    );
  });

  test('should coerce missing lock number header to empty string', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.submitTemplate.mockResolvedValueOnce({
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
        authorizer: { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' },
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

    expect(mocks.templateClient.submitTemplate).toHaveBeenCalledWith(
      '1-2-3',
      {
        internalUserId: 'user-1234',
        clientId: 'nhs-notify-client-id',
      },
      ''
    );
  });

  test('should return template', async () => {
    const { handler, mocks } = setup();

    const response: TemplateDto = {
      id: '1-2-3',
      name: 'updated-name',
      message: 'message',
      templateStatus: 'SUBMITTED',
      templateType: 'SMS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lockNumber: 1,
    };

    mocks.templateClient.submitTemplate.mockResolvedValueOnce({
      data: response,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' },
      },
      pathParameters: { templateId: '1-2-3' },
      headers: { 'X-Lock-Number': '0' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, data: response }),
    });

    expect(mocks.templateClient.submitTemplate).toHaveBeenCalledWith(
      '1-2-3',
      {
        internalUserId: 'user-1234',
        clientId: 'nhs-notify-client-id',
      },
      '0'
    );
  });
});
