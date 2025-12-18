import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { createHandler } from '../../api/count-routing-configs';
import { RoutingConfigClient } from '../../app/routing-config-client';

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

describe('CountRoutingConfigs handler', () => {
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
        mocks.routingConfigClient.countRoutingConfigs
      ).not.toHaveBeenCalled();
    }
  );

  test('should return error when counting routing configs fails', async () => {
    const { handler, mocks } = setup();

    mocks.routingConfigClient.countRoutingConfigs.mockResolvedValueOnce({
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

    expect(mocks.routingConfigClient.countRoutingConfigs).toHaveBeenCalledWith(
      { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' },
      { status: 'DRAFT' }
    );
  });

  test('should return count of routing configs', async () => {
    const { handler, mocks } = setup();

    mocks.routingConfigClient.countRoutingConfigs.mockResolvedValueOnce({
      data: { count: 99 },
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
      body: JSON.stringify({ statusCode: 200, data: { count: 99 } }),
    });

    expect(mocks.routingConfigClient.countRoutingConfigs).toHaveBeenCalledWith(
      { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' },
      { status: 'COMPLETED' }
    );
  });
});
