import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import { TemplateDto } from 'nhs-notify-backend-client';
import { createHandler } from '../../api/list';
import { TemplateClient } from '../../app/template-client';

const setup = () => {
  const templateClient = mock<TemplateClient>();

  const handler = createHandler({ templateClient });

  return { handler, mocks: { templateClient } };
};

describe('Template API - List', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

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

      expect(mocks.templateClient.listTemplates).not.toHaveBeenCalled();
    }
  );

  test('should return 400 - Invalid request when, no user in requestContext', async () => {
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

    expect(mocks.templateClient.listTemplates).not.toHaveBeenCalled();
  });

  test('should return error when listing templates fails', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.listTemplates.mockResolvedValueOnce({
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
    event.pathParameters = { templateId: '1' };
    event.queryStringParameters = null;

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        statusCode: 500,
        technicalMessage: 'Internal server error',
      }),
    });

    expect(mocks.templateClient.listTemplates).toHaveBeenCalledWith(
      {
        internalUserId: 'user-1234',
        clientId: 'nhs-notify-client-id',
      },
      null
    );
  });

  test('should return template with no filters', async () => {
    const { handler, mocks } = setup();

    const template: TemplateDto = {
      id: 'id',
      templateType: 'EMAIL',
      name: 'name',
      message: 'message',
      subject: 'subject',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateStatus: 'NOT_YET_SUBMITTED',
      lockNumber: 1,
    };

    mocks.templateClient.listTemplates.mockResolvedValueOnce({
      data: [template],
    });

    const event = mock<APIGatewayProxyEvent>();
    event.requestContext.authorizer = {
      internalUserId: 'user-1234',
      clientId: 'nhs-notify-client-id',
    };

    event.queryStringParameters = null;

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, data: [template] }),
    });

    expect(mocks.templateClient.listTemplates).toHaveBeenCalledWith(
      {
        internalUserId: 'user-1234',
        clientId: 'nhs-notify-client-id',
      },
      null
    );
  });

  test('should return template with filters', async () => {
    const { handler, mocks } = setup();

    const template: TemplateDto = {
      id: 'id',
      templateType: 'EMAIL',
      name: 'name',
      message: 'message',
      subject: 'subject',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateStatus: 'NOT_YET_SUBMITTED',
      lockNumber: 1,
    };

    mocks.templateClient.listTemplates.mockResolvedValueOnce({
      data: [template],
    });

    const event = mock<APIGatewayProxyEvent>();
    event.requestContext.authorizer = {
      internalUserId: 'user-1234',
      clientId: 'nhs-notify-client-id',
    };

    event.queryStringParameters = {
      templateType: 'LETTER',
      language: 'en',
      letterType: 'x0',
    };

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, data: [template] }),
    });

    expect(mocks.templateClient.listTemplates).toHaveBeenCalledWith(
      {
        internalUserId: 'user-1234',
        clientId: 'nhs-notify-client-id',
      },
      {
        templateType: 'LETTER',
        language: 'en',
        letterType: 'x0',
      }
    );
  });
});
