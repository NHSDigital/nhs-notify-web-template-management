import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import type { Logger } from 'nhs-notify-web-template-management-utils/logger';
import type { RoutingConfigClient } from '../../app/routing-config-client';
import { createHandler } from '../../api/get-routing-configs-by-template-id';

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

describe('GetRoutingConfigsByTemplateId handler', () => {
  const templateId = 'a3690d344-731f-4f60-9047-2c63c96623a2';

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
        pathParameters: {
          templateId,
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
        mocks.routingConfigClient.getRoutingConfigsByTemplateId
      ).not.toHaveBeenCalled();
    }
  );

  test('should return 400 - Invalid request when no templateId', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
      pathParameters: { templateId: undefined },
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
      mocks.routingConfigClient.getRoutingConfigsByTemplateId
    ).not.toHaveBeenCalled();
  });

  test('should return error when getting routing configs fails', async () => {
    const { handler, mocks } = setup();

    mocks.routingConfigClient.getRoutingConfigsByTemplateId.mockResolvedValueOnce(
      {
        error: {
          errorMeta: {
            code: 500,
            description: 'Failed to get routing configs by template',
          },
        },
      }
    );

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
      pathParameters: {
        templateId,
      },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        statusCode: 500,
        technicalMessage: 'Failed to get routing configs by template',
      }),
    });

    expect(
      mocks.routingConfigClient.getRoutingConfigsByTemplateId
    ).toHaveBeenCalledWith(
      { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' },
      templateId
    );
  });

  test('should return empty array when no routing configs reference the template', async () => {
    const { handler, mocks } = setup();

    mocks.routingConfigClient.getRoutingConfigsByTemplateId.mockResolvedValueOnce(
      {
        data: [],
      }
    );

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
      pathParameters: {
        templateId,
      },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, data: [] }),
    });

    expect(
      mocks.routingConfigClient.getRoutingConfigsByTemplateId
    ).toHaveBeenCalledWith(
      { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' },
      templateId
    );
  });

  test('should return routing config references', async () => {
    const { handler, mocks } = setup();

    const routingConfigReferences = [
      { id: '90e46ece-4a3b-47bd-b781-f986b42a5a09', name: 'Message Plan 1' },
      { id: 'a0e46ece-4a3b-47bd-b781-f986b42a5a10', name: 'Message Plan 2' },
    ];

    mocks.routingConfigClient.getRoutingConfigsByTemplateId.mockResolvedValueOnce(
      {
        data: routingConfigReferences,
      }
    );

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
      pathParameters: {
        templateId,
      },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({
        statusCode: 200,
        data: routingConfigReferences,
      }),
    });

    expect(
      mocks.routingConfigClient.getRoutingConfigsByTemplateId
    ).toHaveBeenCalledWith(
      { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' },
      templateId
    );
  });
});
