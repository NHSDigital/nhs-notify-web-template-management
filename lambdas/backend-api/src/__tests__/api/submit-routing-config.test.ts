import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import type { RoutingConfig } from 'nhs-notify-backend-client';
import { createHandler } from '../../api/submit-routing-config';
import { RoutingConfigClient } from '../../app/routing-config-client';
import { routingConfig } from '../fixtures/routing-config';

const setup = () => {
  const routingConfigClient = mock<RoutingConfigClient>();
  const mocks = { routingConfigClient };
  const handler = createHandler(mocks);

  return { handler, mocks };
};

describe('Submit Routing Config Handler', () => {
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
        mocks.routingConfigClient.submitRoutingConfig
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
      mocks.routingConfigClient.submitRoutingConfig
    ).not.toHaveBeenCalled();
  });

  test('should return error when submitting routing config fails', async () => {
    const { handler, mocks } = setup();

    mocks.routingConfigClient.submitRoutingConfig.mockResolvedValueOnce({
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

    expect(mocks.routingConfigClient.submitRoutingConfig).toHaveBeenCalledWith(
      '1-2-3',
      {
        userId: 'sub',
        clientId: 'nhs-notify-client-id',
      }
    );
  });

  test('should return completed routing config', async () => {
    const { handler, mocks } = setup();

    const completed: RoutingConfig = { ...routingConfig, status: 'COMPLETED' };

    mocks.routingConfigClient.submitRoutingConfig.mockResolvedValueOnce({
      data: completed,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
      },
      pathParameters: { routingConfigId: '1-2-3' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, data: completed }),
    });

    expect(mocks.routingConfigClient.submitRoutingConfig).toHaveBeenCalledWith(
      '1-2-3',
      {
        userId: 'sub',
        clientId: 'nhs-notify-client-id',
      }
    );
  });
});
