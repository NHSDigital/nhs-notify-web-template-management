import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import {
  TemplateDto,
  CreateTemplate,
  ITemplateClient,
} from 'nhs-notify-backend-client';
import { createHandler } from '@backend-api/templates/api/create';

const setup = () => {
  const templateClient = mock<ITemplateClient>();

  const handler = createHandler({ templateClient });

  return { handler, mocks: { templateClient } };
};

describe('Template API - Create', () => {
  beforeEach(jest.resetAllMocks);

  test('should return 400 - Invalid request when, no user in requestContext', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { user: undefined } },
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
  });

  test('should return 400 - Invalid request when, no body', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.createTemplate.mockResolvedValueOnce({
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

    expect(mocks.templateClient.createTemplate).toHaveBeenCalledWith({}, 'sub');
  });

  test('should return error when creating template fails', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.createTemplate.mockResolvedValueOnce({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { user: 'sub' } },
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
      'sub'
    );
  });

  test('should return template', async () => {
    const { handler, mocks } = setup();

    const create: CreateTemplate = {
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
    };

    mocks.templateClient.createTemplate.mockResolvedValueOnce({
      data: response,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { user: 'sub' } },
      body: JSON.stringify(create),
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 201,
      body: JSON.stringify({ statusCode: 201, template: response }),
    });

    expect(mocks.templateClient.createTemplate).toHaveBeenCalledWith(
      create,
      'sub'
    );
  });
});
