import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import { createHandler } from '../../api/delete';
import { TemplateClient } from '../../app/template-client';

const setup = () => {
  const templateClient = mock<TemplateClient>();

  const handler = createHandler({ templateClient });

  return { handler, mocks: { templateClient } };
};

describe('Template API - Delete', () => {
  beforeEach(jest.resetAllMocks);

  test.each([
    ['undefined', undefined],
    ['missing user', { clientId: 'client-id', user: undefined }],
    ['missing client', { clientId: undefined, user: 'user-id' }],
  ])(
    'should return 400 - Invalid request when requestContext is %s',
    async (_, ctx) => {
      const { handler, mocks } = setup();

      const event = mock<APIGatewayProxyEvent>({
        requestContext: { authorizer: ctx },
        pathParameters: { templateId: 'id' },
        headers: {
          'X-Lock-Number': '0',
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

      expect(mocks.templateClient.deleteTemplate).not.toHaveBeenCalled();
    }
  );

  test('should return 400 - Invalid request when, no templateId', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
      },
      body: JSON.stringify({ name: 'test' }),
      pathParameters: { templateId: undefined },
      headers: {
        'X-Lock-Number': '0',
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

    expect(mocks.templateClient.deleteTemplate).not.toHaveBeenCalled();
  });

  test('should return error when deleting template fails', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.deleteTemplate.mockResolvedValueOnce({
      error: {
        errorMeta: {
          code: 500,
          description: 'Internal server error',
        },
      },
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
      },
      pathParameters: { templateId: '1-2-3' },
      headers: {
        'X-Lock-Number': '0',
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

    expect(mocks.templateClient.deleteTemplate).toHaveBeenCalledWith(
      '1-2-3',
      {
        userId: 'sub',
        clientId: 'nhs-notify-client-id',
      },
      '0'
    );
  });

  test('should return no content', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.deleteTemplate.mockResolvedValueOnce({
      data: undefined,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
      },
      pathParameters: { templateId: '1-2-3' },
      headers: {
        'X-Lock-Number': '0',
      },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 204,
      body: JSON.stringify({ statusCode: 204, template: undefined }),
    });

    expect(mocks.templateClient.deleteTemplate).toHaveBeenCalledWith(
      '1-2-3',
      {
        userId: 'sub',
        clientId: 'nhs-notify-client-id',
      },
      '0'
    );
  });

  test('coerces missing lock number header to empty string', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.deleteTemplate.mockResolvedValueOnce({
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
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
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

    expect(mocks.templateClient.deleteTemplate).toHaveBeenCalledWith(
      '1-2-3',
      { userId: 'sub', clientId: 'nhs-notify-client-id' },
      ''
    );
  });
});
