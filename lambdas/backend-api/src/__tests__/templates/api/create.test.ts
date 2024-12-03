import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import {
  TemplateDTO,
  TemplateStatus,
  TemplateType,
  CreateTemplate,
} from 'nhs-notify-backend-client';
import { handler } from '@backend-api/templates/api/create';
import { createTemplate } from '@backend-api/templates/app/create-template';

jest.mock('@backend-api/templates/app/create-template');

const createTemplateMock = jest.mocked(createTemplate);

describe('Template API - Create', () => {
  beforeEach(jest.resetAllMocks);

  test('should return 400 - Invalid request when, no username in requestContext', async () => {
    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { username: undefined } },
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

    expect(createTemplateMock).not.toHaveBeenCalled();
  });

  test('should return 400 - Invalid request when, no body', async () => {
    createTemplateMock.mockResolvedValueOnce({
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
      requestContext: { authorizer: { username: 'username' } },
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

    expect(createTemplateMock).toHaveBeenCalledWith({}, 'username');
  });

  test('should return error when creating template fails', async () => {
    createTemplateMock.mockResolvedValueOnce({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { username: 'username' } },
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

    expect(createTemplateMock).toHaveBeenCalledWith({ id: 1 }, 'username');
  });

  test('should return template', async () => {
    const create: CreateTemplate = {
      name: 'updated-name',
      message: 'message',
      templateType: TemplateType.SMS,
    };
    const response: TemplateDTO = {
      ...create,
      id: 'id',
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createTemplateMock.mockResolvedValueOnce({
      data: response,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { username: 'username' } },
      body: JSON.stringify(create),
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 201,
      body: JSON.stringify({ statusCode: 201, template: response }),
    });

    expect(createTemplateMock).toHaveBeenCalledWith(create, 'username');
  });
});
