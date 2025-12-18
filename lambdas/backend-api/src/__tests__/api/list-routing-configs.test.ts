import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { createHandler } from '../../api/list-routing-configs';
import { RoutingConfigClient } from '../../app/routing-config-client';
import { makeRoutingConfig } from '../fixtures/routing-config';

jest.mock('nhs-notify-web-template-management-utils/logger', () => ({
  logger: mock<Logger>({
    child: jest.fn().mockReturnThis(),
  }),
}));

const setup = () => {
  const routingConfigClient = mock<RoutingConfigClient>();

  const handler = createHandler({ routingConfigClient });

  return { handler, mocks: { routingConfigClient } };
};

describe('ListRoutingConfig handler', () => {
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
        mocks.routingConfigClient.listRoutingConfigs
      ).not.toHaveBeenCalled();
    }
  );

  test('should return error when listing routing configs fails', async () => {
    const { handler, mocks } = setup();

    mocks.routingConfigClient.listRoutingConfigs.mockResolvedValueOnce({
      error: {
        errorMeta: {
          code: 500,
          description: 'Internal server error',
        },
      },
    });

    const event = mock<APIGatewayProxyEvent>();
    event.requestContext.authorizer = {
      internalUserId: 'user-1234',
      clientId: 'nhs-notify-client-id',
    };

    event.queryStringParameters = {
      status: 'DRAFT',
    };

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        statusCode: 500,
        technicalMessage: 'Internal server error',
      }),
    });

    expect(mocks.routingConfigClient.listRoutingConfigs).toHaveBeenCalledWith(
      { clientId: 'nhs-notify-client-id', internalUserId: 'user-1234' },
      { status: 'DRAFT' }
    );
  });

  test('should return list of routing configs', async () => {
    const { handler, mocks } = setup();

    const list = [
      makeRoutingConfig({
        clientId: 'nhs-notify-client-id',
        status: 'COMPLETED',
      }),
      makeRoutingConfig({
        clientId: 'nhs-notify-client-id',
        status: 'COMPLETED',
      }),
    ];

    mocks.routingConfigClient.listRoutingConfigs.mockResolvedValueOnce({
      data: list,
    });

    const event = mock<APIGatewayProxyEvent>();
    event.requestContext.authorizer = {
      internalUserId: 'user-1234',
      clientId: 'nhs-notify-client-id',
    };
    event.queryStringParameters = {
      status: 'COMPLETED',
    };

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, data: list }),
    });

    expect(mocks.routingConfigClient.listRoutingConfigs).toHaveBeenCalledWith(
      { clientId: 'nhs-notify-client-id', internalUserId: 'user-1234' },
      { status: 'COMPLETED' }
    );
  });
});
