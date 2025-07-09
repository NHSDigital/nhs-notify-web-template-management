import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import { ClientConfiguration } from 'nhs-notify-backend-client';
import { createHandler } from '@backend-api/templates/api/get-client-configuration';
import { TemplateClient } from '@backend-api/templates/app/template-client';

const setup = () => {
  const templateClient = mock<TemplateClient>();

  const handler = createHandler({ templateClient });

  return { handler, mocks: { templateClient } };
};

describe('Template API - get client configuration', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should return 400 - Invalid request when, no user or client in requestContext', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: undefined },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        technicalMessage: 'Invalid request',
      }),
    });

    expect(mocks.templateClient.getClientConfiguration).not.toHaveBeenCalled();
  });

  test('should return error when getting client fails', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.getClientConfiguration.mockResolvedValueOnce({
      error: {
        code: 404,
        message: 'Could not retrieve client configuration',
      },
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
      },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 404,
      body: JSON.stringify({
        statusCode: 404,
        technicalMessage: 'Could not retrieve client configuration',
      }),
    });

    expect(mocks.templateClient.getClientConfiguration).toHaveBeenCalledWith({
      userId: 'sub',
      clientId: 'nhs-notify-client-id',
    });
  });

  test('should return client', async () => {
    const { handler, mocks } = setup();

    const clientConfiguration: ClientConfiguration = {
      features: { proofing: false },
      campaignId: 'campaign',
    };

    mocks.templateClient.getClientConfiguration.mockResolvedValueOnce({
      data: clientConfiguration,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
      },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ clientConfiguration, statusCode: 200 }),
    });

    expect(mocks.templateClient.getClientConfiguration).toHaveBeenCalledWith({
      userId: 'sub',
      clientId: 'nhs-notify-client-id',
    });
  });
});
