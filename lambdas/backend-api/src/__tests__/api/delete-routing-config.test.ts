import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import { createHandler } from '../../api/delete-routing-config';
import { RoutingConfigClient } from '../../app/routing-config-client';

const setup = () => {
  const routingConfigClient = mock<RoutingConfigClient>();
  const mocks = { routingConfigClient };
  const handler = createHandler(mocks);

  return { handler, mocks };
};

describe('Delete Routing Config Handler', () => {
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
        mocks.routingConfigClient.deleteRoutingConfig
      ).not.toHaveBeenCalled();
    }
  );

  test('should return 400 - Invalid request when, no routingConfigId', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
      },
      body: JSON.stringify({ name: 'test' }),
      pathParameters: { routingConfigId: undefined },
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
      mocks.routingConfigClient.deleteRoutingConfig
    ).not.toHaveBeenCalled();
  });

  test('should return error when deleting routing config fails', async () => {
    const { handler, mocks } = setup();

    mocks.routingConfigClient.deleteRoutingConfig.mockResolvedValueOnce({
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
      pathParameters: { routingConfigId: '1-2-3' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        statusCode: 500,
        technicalMessage: 'Internal server error',
      }),
    });

    expect(mocks.routingConfigClient.deleteRoutingConfig).toHaveBeenCalledWith(
      '1-2-3',
      {
        userId: 'sub',
        clientId: 'nhs-notify-client-id',
      }
    );
  });

  test('should return 204 no content response after deleting routing config', async () => {
    const { handler, mocks } = setup();

    mocks.routingConfigClient.deleteRoutingConfig.mockResolvedValueOnce({
      data: undefined,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
      },
      pathParameters: { routingConfigId: '1-2-3' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 204,
      body: JSON.stringify({ statusCode: 204, data: undefined }),
    });

    expect(mocks.routingConfigClient.deleteRoutingConfig).toHaveBeenCalledWith(
      '1-2-3',
      {
        userId: 'sub',
        clientId: 'nhs-notify-client-id',
      }
    );
  });
});
