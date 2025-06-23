import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import { TemplateDto, CreateUpdateTemplate } from 'nhs-notify-backend-client';
import { createHandler } from '@backend-api/templates/api/update';
import { TemplateClient } from '@backend-api/templates/app/template-client';

const setup = () => {
  const templateClient = mock<TemplateClient>();

  const handler = createHandler({ templateClient });

  return { handler, mocks: { templateClient } };
};

describe('Template API - Update', () => {
  beforeEach(jest.resetAllMocks);

  test('should return 400 - Invalid request when, no user in requestContext', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { user: undefined } },
      body: JSON.stringify({ name: 'test' }),
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

    expect(mocks.templateClient.updateTemplate).not.toHaveBeenCalled();
  });

  test('should return 400 - Invalid request when, no body', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.updateTemplate.mockResolvedValueOnce({
      error: {
        code: 400,
        message: 'Validation failed',
        details: {
          templateType: 'Required',
        },
      },
      data: undefined,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { user: 'sub' } },
      pathParameters: { templateId: '1-2-3' },
      body: undefined,
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        technicalMessage: 'Validation failed',
        details: {
          templateType: 'Required',
        },
      }),
    });

    expect(mocks.templateClient.updateTemplate).toHaveBeenCalledWith(
      '1-2-3',
      {},
      'sub'
    );
  });

  test('should return 400 - Invalid request when, no templateId', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { user: 'sub' } },
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

    expect(mocks.templateClient.updateTemplate).not.toHaveBeenCalled();
  });

  test('should return error when updating template fails', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.updateTemplate.mockResolvedValueOnce({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { user: 'sub' } },
      body: JSON.stringify({ name: 'name' }),
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

    expect(mocks.templateClient.updateTemplate).toHaveBeenCalledWith(
      '1-2-3',
      { name: 'name' },
      'sub'
    );
  });

  test('should return template', async () => {
    const { handler, mocks } = setup();

    const update: CreateUpdateTemplate = {
      name: 'updated-name',
      message: 'message',
      templateType: 'SMS',
    };
    const response: TemplateDto = {
      ...update,
      id: '1-2-3',
      templateType: 'SMS',
      templateStatus: 'NOT_YET_SUBMITTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mocks.templateClient.updateTemplate.mockResolvedValueOnce({
      data: response,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { user: 'sub' } },
      body: JSON.stringify(update),
      pathParameters: { templateId: '1-2-3' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, template: response }),
    });

    expect(mocks.templateClient.updateTemplate).toHaveBeenCalledWith(
      '1-2-3',
      update,
      'sub'
    );
  });
});
