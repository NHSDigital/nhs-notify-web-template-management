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
    ['missing user', { clientId: 'client-id', internalUserId: undefined }],
    ['missing client', { clientId: undefined, internalUserId: 'user-1234' }],
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

      expect(
        mocks.routingConfigClient.submitRoutingConfig
      ).not.toHaveBeenCalled();
    }
  );

  test('should return 400 - Invalid request when, no routingConfigId', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
      body: JSON.stringify({ name: 'test' }),
      pathParameters: { routingConfigId: undefined },
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
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
      pathParameters: { routingConfigId: '1-2-3' },
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

    expect(mocks.routingConfigClient.submitRoutingConfig).toHaveBeenCalledWith(
      '1-2-3',
      {
        internalUserId: 'user-1234',
        clientId: 'nhs-notify-client-id',
      },
      '0'
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
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
      pathParameters: { routingConfigId: '1-2-3' },
      headers: {
        'X-Lock-Number': '0',
      },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, data: completed }),
    });

    expect(mocks.routingConfigClient.submitRoutingConfig).toHaveBeenCalledWith(
      '1-2-3',
      {
        internalUserId: 'user-1234',
        clientId: 'nhs-notify-client-id',
      },
      '0'
    );
  });

  test('coerces missing lock number header to empty string', async () => {
    const { handler, mocks } = setup();

    mocks.routingConfigClient.submitRoutingConfig.mockResolvedValueOnce({
      error: {
        errorMeta: {
          code: 409,
          description:
            'Lock number mismatch - Routing configuration has been modified since last read',
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
      pathParameters: { routingConfigId: '1-2-3' },
      headers: {},
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 409,
      body: JSON.stringify({
        statusCode: 409,
        technicalMessage:
          'Lock number mismatch - Routing configuration has been modified since last read',
      }),
    });

    expect(mocks.routingConfigClient.submitRoutingConfig).toHaveBeenCalledWith(
      '1-2-3',
      { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' },
      ''
    );
  });
});
