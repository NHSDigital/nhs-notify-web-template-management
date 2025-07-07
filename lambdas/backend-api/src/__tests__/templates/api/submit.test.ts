import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock, mockDeep } from 'jest-mock-extended';
import { TemplateDto } from 'nhs-notify-backend-client';
import { createHandler } from '@backend-api/templates/api/submit';
import { EmailClient } from '@backend-api/templates/infra/email-client';
import { TemplateClient } from '@backend-api/templates/app/template-client';

const setup = () => {
  const templateClient = mock<TemplateClient>();
  const emailClient = mockDeep<EmailClient>();

  const handler = createHandler({ templateClient, emailClient });

  return { handler, mocks: { templateClient } };
};

describe('Template API - Submit', () => {
  beforeEach(jest.resetAllMocks);

  test('should return 400 - Invalid request when, no user in requestContext', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: undefined },
      pathParameters: { templateId: '1-2-3' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        technicalMessage: 'Invalid request',
      }),
    });

    expect(mocks.templateClient.submitTemplate).not.toHaveBeenCalled();
  });

  test('should return 400 - Invalid request when, no templateId', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
      },
      body: JSON.stringify({ name: 'test' }),
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

    expect(mocks.templateClient.submitTemplate).not.toHaveBeenCalled();
  });

  test('should return error when submitting template fails', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.submitTemplate.mockResolvedValueOnce({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
      },
      pathParameters: { templateId: '1-2-3' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        statusCode: 500,
        technicalMessage: 'Internal server error',
      }),
    });

    expect(mocks.templateClient.submitTemplate).toHaveBeenCalledWith('1-2-3', {
      userId: 'sub',
      clientId: 'nhs-notify-client-id',
    });
  });

  test('should return template', async () => {
    const { handler, mocks } = setup();

    const response: TemplateDto = {
      id: '1-2-3',
      name: 'updated-name',
      message: 'message',
      templateStatus: 'SUBMITTED',
      templateType: 'SMS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mocks.templateClient.submitTemplate.mockResolvedValueOnce({
      data: response,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
      },
      pathParameters: { templateId: '1-2-3' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, template: response }),
    });

    expect(mocks.templateClient.submitTemplate).toHaveBeenCalledWith('1-2-3', {
      userId: 'sub',
      clientId: 'nhs-notify-client-id',
    });
  });
});
