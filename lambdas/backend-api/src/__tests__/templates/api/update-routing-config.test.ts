import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import type {
  CreateUpdateRoutingConfig,
  RoutingConfig,
} from 'nhs-notify-backend-client';
import { createHandler } from '@backend-api/templates/api/update-routing-config';
import { RoutingConfigClient } from '@backend-api/templates/app/routing-config-client';
import { routingConfig } from '../fixtures/routing-config';

const setup = () => {
  const routingConfigClient = mock<RoutingConfigClient>();
  const mocks = { routingConfigClient };
  const handler = createHandler(mocks);

  return { handler, mocks };
};

describe('Update Routing Config Handler', () => {
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
        mocks.routingConfigClient.updateRoutingConfig
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
      mocks.routingConfigClient.updateRoutingConfig
    ).not.toHaveBeenCalled();
  });

  test('body defaults to empty object when absent', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
      },
      body: undefined,
      pathParameters: { routingConfigId: 'id' },
    });

    mocks.routingConfigClient.updateRoutingConfig.mockResolvedValueOnce({
      error: {
        errorMeta: {
          code: 400,
          description: 'Invalid request',
        },
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

    expect(mocks.routingConfigClient.updateRoutingConfig).toHaveBeenCalledWith(
      'id',
      {},
      {
        userId: 'sub',
        clientId: 'nhs-notify-client-id',
      }
    );
  });

  test('should return error when updating routing config fails', async () => {
    const { handler, mocks } = setup();

    const update: CreateUpdateRoutingConfig = {
      cascade: [
        {
          defaultTemplateId: 'id',
          channel: 'EMAIL',
          cascadeGroups: ['standard'],
          channelType: 'primary',
        },
      ],
      cascadeGroupOverrides: [{ name: 'standard' }],
      campaignId: 'campaign',
      name: 'new name',
    };

    mocks.routingConfigClient.updateRoutingConfig.mockResolvedValueOnce({
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
      body: JSON.stringify(update),
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

    expect(mocks.routingConfigClient.updateRoutingConfig).toHaveBeenCalledWith(
      '1-2-3',
      update,
      {
        userId: 'sub',
        clientId: 'nhs-notify-client-id',
      }
    );
  });

  test('should return updated routing config', async () => {
    const { handler, mocks } = setup();

    const update: CreateUpdateRoutingConfig = {
      cascade: [
        {
          defaultTemplateId: 'id',
          channel: 'EMAIL',
          cascadeGroups: ['standard'],
          channelType: 'primary',
        },
      ],
      cascadeGroupOverrides: [{ name: 'standard' }],
      campaignId: 'campaign',
      name: 'new name',
    };

    const updated: RoutingConfig = { ...routingConfig, ...update };

    mocks.routingConfigClient.updateRoutingConfig.mockResolvedValueOnce({
      data: updated,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
      },
      body: JSON.stringify(update),
      pathParameters: { routingConfigId: '1-2-3' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, data: updated }),
    });

    expect(mocks.routingConfigClient.updateRoutingConfig).toHaveBeenCalledWith(
      '1-2-3',
      update,
      {
        userId: 'sub',
        clientId: 'nhs-notify-client-id',
      }
    );
  });
});
