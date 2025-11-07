import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import type { RoutingConfigClient } from '../../app/routing-config-client';
import { createHandler } from '../../api/get-routing-config';
import { routingConfig } from '../fixtures/routing-config';

jest.mock('nhs-notify-web-template-management-utils/logger', () => ({
  logger: mock<Logger>({
    child: jest.fn().mockReturnThis(),
  }),
}));

function setup() {
  const routingConfigClient = mock<RoutingConfigClient>();
  const mocks = { routingConfigClient };
  const handler = createHandler(mocks);

  return { handler, mocks };
}

describe('GetRoutingConfig handler', () => {
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
        pathParameters: {
          routingConfigId: '3690d344-731f-4f60-9047-2c63c96623a2',
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

      expect(mocks.routingConfigClient.getRoutingConfig).not.toHaveBeenCalled();
    }
  );

  test('should return 400 - Invalid request when no routingConfigId', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
      },
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

    expect(mocks.routingConfigClient.getRoutingConfig).not.toHaveBeenCalled();
  });

  test('should return error when getting routing config fails', async () => {
    const { handler, mocks } = setup();

    mocks.routingConfigClient.getRoutingConfig.mockResolvedValueOnce({
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
      pathParameters: {
        routingConfigId: '3690d344-731f-4f60-9047-2c63c96623a2',
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

    expect(mocks.routingConfigClient.getRoutingConfig).toHaveBeenCalledWith(
      '3690d344-731f-4f60-9047-2c63c96623a2',
      { userId: 'sub', clientId: 'nhs-notify-client-id' }
    );
  });

  test('should return routing config', async () => {
    const { handler, mocks } = setup();

    mocks.routingConfigClient.getRoutingConfig.mockResolvedValueOnce({
      data: routingConfig,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
      },
      pathParameters: {
        routingConfigId: '3690d344-731f-4f60-9047-2c63c96623a2',
      },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, data: routingConfig }),
    });

    expect(mocks.routingConfigClient.getRoutingConfig).toHaveBeenCalledWith(
      '3690d344-731f-4f60-9047-2c63c96623a2',
      { userId: 'sub', clientId: 'nhs-notify-client-id' }
    );
  });
});
