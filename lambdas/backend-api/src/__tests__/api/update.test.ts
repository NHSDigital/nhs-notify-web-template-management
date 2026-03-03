import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import type {
  TemplateDto,
  CreateUpdateTemplate,
} from 'nhs-notify-web-template-management-types';
import { createHandler } from '../../api/update';
import { TemplateClient } from '../../app/template-client';

const setup = () => {
  const templateClient = mock<TemplateClient>();

  const handler = createHandler({ templateClient });

  return { handler, mocks: { templateClient } };
};

describe('Template API - Update', () => {
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
        body: JSON.stringify({ name: 'test' }),
        headers: {
          'X-Lock-Number': '1',
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

      expect(mocks.templateClient.updateTemplate).not.toHaveBeenCalled();
    }
  );

  test('should return 400 - Invalid request when, no user in requestContext', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: undefined },
      body: JSON.stringify({ name: 'test' }),
      pathParameters: { templateId: '1-2-3' },
      headers: {
        'X-Lock-Number': '1',
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

    expect(mocks.templateClient.updateTemplate).not.toHaveBeenCalled();
  });

  test('should return 400 - Invalid request when, no body', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.updateTemplate.mockResolvedValueOnce({
      error: {
        errorMeta: {
          code: 400,
          description: 'Validation failed',
          details: {
            templateType: 'Invalid input: expected string, received undefined',
          },
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
        'X-Lock-Number': '1',
      },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        technicalMessage: 'Validation failed',
        details: {
          templateType: 'Invalid input: expected string, received undefined',
        },
      }),
    });

    expect(mocks.templateClient.updateTemplate).toHaveBeenCalledWith(
      '1-2-3',
      {},
      { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' },
      '1'
    );
  });

  test('should return 400 - Invalid request when, no templateId', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
      body: JSON.stringify({ name: 'test' }),
      pathParameters: { templateId: undefined },
      headers: {
        'X-Lock-Number': '1',
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

    expect(mocks.templateClient.updateTemplate).not.toHaveBeenCalled();
  });

  test('should return error when updating template fails', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.updateTemplate.mockResolvedValueOnce({
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
      body: JSON.stringify({ name: 'name' }),
      pathParameters: { templateId: '1-2-3' },
      headers: {
        'X-Lock-Number': '1',
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

    expect(mocks.templateClient.updateTemplate).toHaveBeenCalledWith(
      '1-2-3',
      { name: 'name' },
      { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' },
      '1'
    );
  });

  test('should return template', async () => {
    const { handler, mocks } = setup();

    const update: CreateUpdateTemplate = {
      name: 'updated-name',
      message: 'message',
      templateType: 'SMS',
    };
    const response: TemplateDto = {
      ...update,
      id: '1-2-3',
      templateType: 'SMS',
      templateStatus: 'NOT_YET_SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lockNumber: 2,
    };

    mocks.templateClient.updateTemplate.mockResolvedValueOnce({
      data: response,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
      body: JSON.stringify(update),
      pathParameters: { templateId: '1-2-3' },
      headers: {
        'X-Lock-Number': '1',
      },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, data: response }),
    });

    expect(mocks.templateClient.updateTemplate).toHaveBeenCalledWith(
      '1-2-3',
      update,
      { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' },
      '1'
    );
  });

  test('coerces lock number header to empty string if missing', async () => {
    const { handler, mocks } = setup();

    const update: CreateUpdateTemplate = {
      name: 'updated-name',
      message: 'message',
      templateType: 'SMS',
    };

    mocks.templateClient.updateTemplate.mockResolvedValueOnce({
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
      body: JSON.stringify(update),
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

    expect(mocks.templateClient.updateTemplate).toHaveBeenCalledWith(
      '1-2-3',
      update,
      { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' },
      ''
    );
  });
});
