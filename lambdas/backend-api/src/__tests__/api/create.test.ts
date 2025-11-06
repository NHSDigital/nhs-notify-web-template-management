import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import { TemplateDto, CreateUpdateTemplate } from 'nhs-notify-backend-client';
import { createHandler } from '../../api/create';
import { TemplateClient } from '../../app/template-client';

const setup = () => {
  const templateClient = mock<TemplateClient>();

  const handler = createHandler({ templateClient });

  return { handler, mocks: { templateClient } };
};

describe('Template API - Create', () => {
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
        body: JSON.stringify({ id: 1 }),
      });

      const result = await handler(event, mock<Context>(), jest.fn());

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          statusCode: 400,
          technicalMessage: 'Invalid request',
        }),
      });

      expect(mocks.templateClient.createTemplate).not.toHaveBeenCalled();
    }
  );

  test('should return 400 - Invalid request when, no body', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.createTemplate.mockResolvedValueOnce({
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

    expect(mocks.templateClient.createTemplate).toHaveBeenCalledWith(
      {},
      { userId: 'sub', clientId: 'nhs-notify-client-id' }
    );
  });

  test('should return error when creating template fails', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.createTemplate.mockResolvedValueOnce({
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

    expect(mocks.templateClient.createTemplate).toHaveBeenCalledWith(
      { id: 1 },
      { userId: 'sub', clientId: 'nhs-notify-client-id' }
    );
  });

  test('should return template', async () => {
    const { handler, mocks } = setup();

    const create: CreateUpdateTemplate = {
      name: 'updated-name',
      message: 'message',
      templateType: 'SMS',
    };
    const response: TemplateDto = {
      ...create,
      id: 'id',
      templateStatus: 'NOT_YET_SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lockNumber: 1,
    };

    mocks.templateClient.createTemplate.mockResolvedValueOnce({
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

    expect(mocks.templateClient.createTemplate).toHaveBeenCalledWith(create, {
      userId: 'sub',
      clientId: 'notify-client-id',
    });
  });
});
