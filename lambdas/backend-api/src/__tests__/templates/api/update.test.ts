import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import {
  TemplateDTO,
  TemplateStatus,
  TemplateType,
  UpdateTemplate,
} from 'nhs-notify-backend-client';
import { handler } from '@backend-api/templates/api/update';
import { updateTemplate } from '@backend-api/templates/app/update-template';

jest.mock('@backend-api/templates/app/update-template');

const updateTemplateMock = jest.mocked(updateTemplate);

describe('Template API - Update', () => {
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

    expect(updateTemplateMock).not.toHaveBeenCalled();
  });

  test('should return 400 - Invalid request when, no body', async () => {
    updateTemplateMock.mockResolvedValueOnce({
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

    expect(updateTemplateMock).toHaveBeenCalledWith({}, 'token');
  });

  test('should return error when updating template fails', async () => {
    updateTemplateMock.mockResolvedValueOnce({
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

    expect(updateTemplateMock).toHaveBeenCalledWith({ id: 1 }, 'token');
  });

  test('should return template', async () => {
    const update: UpdateTemplate = {
      id: 'id',
      name: 'updated-name',
      message: 'message',
      status: TemplateStatus.NOT_YET_SUBMITTED,
      type: TemplateType.EMAIL,
    };
    const response: TemplateDTO = {
      ...update,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateTemplateMock.mockResolvedValueOnce({
      data: response,
    });

    const event = mock<APIGatewayProxyEvent>({
      headers: { Authorization: 'token' },
      body: JSON.stringify(update),
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, template: response }),
    });

    expect(updateTemplateMock).toHaveBeenCalledWith(update, 'token');
  });
});
