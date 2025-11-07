import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import {
  CreateUpdateRoutingConfig,
  RoutingConfig,
} from 'nhs-notify-backend-client';
import { createHandler } from '../../api/create-routing-config';
import type { RoutingConfigClient } from '../../app/routing-config-client';

function setup() {
  const routingConfigClient = mock<RoutingConfigClient>();
  const mocks = { routingConfigClient };
  const handler = createHandler(mocks);

  return { handler, mocks };
}

describe('Create Routing Config Handler', () => {
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
        body: JSON.stringify({}),
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
        mocks.routingConfigClient.createRoutingConfig
      ).not.toHaveBeenCalled();
    }
  );

  test('should return 400 - Invalid request when no body', async () => {
    const { handler, mocks } = setup();

    mocks.routingConfigClient.createRoutingConfig.mockResolvedValueOnce({
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
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
      },
      body: undefined,
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

    expect(mocks.routingConfigClient.createRoutingConfig).toHaveBeenCalledWith(
      {},
      { userId: 'sub', clientId: 'nhs-notify-client-id' }
    );
  });

  test('should return error when creating routing config fails', async () => {
    const { handler, mocks } = setup();

    mocks.routingConfigClient.createRoutingConfig.mockResolvedValueOnce({
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
      body: JSON.stringify({ id: 1 }),
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        statusCode: 500,
        technicalMessage: 'Internal server error',
      }),
    });

    expect(mocks.routingConfigClient.createRoutingConfig).toHaveBeenCalledWith(
      { id: 1 },
      { userId: 'sub', clientId: 'nhs-notify-client-id' }
    );
  });

  test('should return created routing config', async () => {
    const { handler, mocks } = setup();

    const create: CreateUpdateRoutingConfig = {
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: 'apptemplate',
        },
      ],
      cascadeGroupOverrides: [{ name: 'standard' }],
      name: 'app RC',
      campaignId: 'campaign',
    };

    const response: RoutingConfig = {
      ...create,
      id: 'id',
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clientId: 'nhs-notify-client-id',
    };

    mocks.routingConfigClient.createRoutingConfig.mockResolvedValueOnce({
      data: response,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'notify-client-id' },
      },
      body: JSON.stringify(create),
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 201,
      body: JSON.stringify({ statusCode: 201, data: response }),
    });

    expect(mocks.routingConfigClient.createRoutingConfig).toHaveBeenCalledWith(
      create,
      {
        userId: 'sub',
        clientId: 'notify-client-id',
      }
    );
  });
});
