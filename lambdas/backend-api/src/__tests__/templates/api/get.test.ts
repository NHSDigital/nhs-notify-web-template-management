import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import { TemplateDto } from 'nhs-notify-backend-client';
import { createHandler } from '@backend-api/templates/api/get';
import { TemplateClient } from '@backend-api/templates/app/template-client';

const setup = () => {
  const templateClient = mock<TemplateClient>();

  const handler = createHandler({ templateClient });

  return { handler, mocks: { templateClient } };
};

describe('Template API - Get', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should return 400 - Invalid request when, no user in requestContext', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: undefined },
      pathParameters: { templateId: '1' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        technicalMessage: 'Invalid request',
      }),
    });

    expect(mocks.templateClient.getTemplate).not.toHaveBeenCalled();
  });

  test('should return 400 - Invalid request when, no templateId', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
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

    expect(mocks.templateClient.getTemplate).not.toHaveBeenCalled();
  });

  test('should return error when getting template fails', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.getTemplate.mockResolvedValueOnce({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
      },
      pathParameters: { templateId: '1' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        statusCode: 500,
        technicalMessage: 'Internal server error',
      }),
    });

    expect(mocks.templateClient.getTemplate).toHaveBeenCalledWith('1', {
      userId: 'sub',
      clientId: 'nhs-notify-client-id',
    });
  });

  test('should return template', async () => {
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
    };

    mocks.templateClient.getTemplate.mockResolvedValueOnce({
      data: template,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
      },
      pathParameters: { templateId: '1' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, template }),
    });

    expect(mocks.templateClient.getTemplate).toHaveBeenCalledWith('1', {
      userId: 'sub',
      clientId: 'nhs-notify-client-id',
    });
  });
});
