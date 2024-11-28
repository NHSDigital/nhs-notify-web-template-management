import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import {
  TemplateDTO,
  TemplateStatus,
  TemplateType,
  CreateTemplateInput,
} from 'nhs-notify-templates-client';
import { handler } from '@backend-api/templates/api/create';
import { createTemplate } from '@backend-api/templates/app/create-template';

jest.mock('@backend-api/templates/app/create-template');

const createTemplateMock = jest.mocked(createTemplate);

describe('Template API - Create', () => {
  beforeEach(jest.resetAllMocks);

  test('should return 400 - Invalid request when, no Authorization token', async () => {
    const event = mock<APIGatewayProxyEvent>({
      headers: { Authorization: undefined },
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
        message: 'Missing required fields',
      },
    });

    const event = mock<APIGatewayProxyEvent>({
      headers: { Authorization: 'token' },
      body: undefined,
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        technicalMessage: 'Missing required fields',
      }),
    });

    expect(createTemplateMock).toHaveBeenCalledWith({}, 'token');
  });

  test('should return error when creating template fails', async () => {
    createTemplateMock.mockResolvedValueOnce({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });

    const event = mock<APIGatewayProxyEvent>({
      headers: { Authorization: 'token' },
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

    expect(createTemplateMock).toHaveBeenCalledWith({ id: 1 }, 'token');
  });

  test('should return template', async () => {
    const create: CreateTemplateInput = {
      name: 'updated-name',
      message: 'message',
      type: TemplateType.SMS,
    };
    const response: TemplateDTO = {
      ...create,
      id: 'id',
      status: TemplateStatus.NOT_YET_SUBMITTED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createTemplateMock.mockResolvedValueOnce({
      data: response,
    });

    const event = mock<APIGatewayProxyEvent>({
      headers: { Authorization: 'token' },
      body: JSON.stringify(create),
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 201,
      body: JSON.stringify({ statusCode: 201, template: response }),
    });

    expect(createTemplateMock).toHaveBeenCalledWith(create, 'token');
  });
});
