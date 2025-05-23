import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import { ITemplateClient, TemplateDto } from 'nhs-notify-backend-client';
import { createHandler } from '@backend-api/templates/api/list';

const setup = () => {
  const templateClient = mock<ITemplateClient>();

  const handler = createHandler({ templateClient });

  return { handler, mocks: { templateClient } };
};

describe('Template API - List', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should return 400 - Invalid request when, no user in requestContext', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { user: undefined } },
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
        code: 500,
        message: 'Internal server error',
      },
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { user: 'sub' } },
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

    expect(mocks.templateClient.listTemplates).toHaveBeenCalledWith('sub');
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

    mocks.templateClient.listTemplates.mockResolvedValueOnce({
      data: [template],
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { user: 'sub' } },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, templates: [template] }),
    });

    expect(mocks.templateClient.listTemplates).toHaveBeenCalledWith('sub');
  });
});
