import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import {
  TemplateDTO,
  TemplateStatus,
  TemplateType,
  UpdateTemplate,
} from 'nhs-notify-backend-client';
import { handler } from '@backend-api/templates/api/update';
import { TemplateClient } from '@backend-api/templates/app/template-client';

jest.mock('@backend-api/templates/app/template-client');

const updateTemplateMock = jest.spyOn(
  TemplateClient.prototype,
  'updateTemplate'
);

describe('Template API - Update', () => {
  beforeEach(jest.resetAllMocks);

  test('should return 400 - Invalid request when, no user in requestContext', async () => {
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

    expect(updateTemplateMock).not.toHaveBeenCalled();
  });

  test('should return 400 - Invalid request when, no body', async () => {
    updateTemplateMock.mockResolvedValueOnce({
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

    expect(TemplateClient).toHaveBeenCalledWith('sub', false);

    expect(updateTemplateMock).toHaveBeenCalledWith('1-2-3', {});
  });

  test('should return 400 - Invalid request when, no templateId', async () => {
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

    expect(updateTemplateMock).not.toHaveBeenCalled();
  });

  test('should return error when updating template fails', async () => {
    updateTemplateMock.mockResolvedValueOnce({
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

    expect(TemplateClient).toHaveBeenCalledWith('sub', false);

    expect(updateTemplateMock).toHaveBeenCalledWith('1-2-3', { name: 'name' });
  });

  test('should return template', async () => {
    const update: UpdateTemplate = {
      name: 'updated-name',
      message: 'message',
      templateStatus: 'NOT_YET_SUBMITTED',
      templateType: 'SMS',
    };
    const response: TemplateDTO = {
      ...update,
      id: '1-2-3',
      templateType: 'SMS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateTemplateMock.mockResolvedValueOnce({
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

    expect(TemplateClient).toHaveBeenCalledWith('sub', false);

    expect(updateTemplateMock).toHaveBeenCalledWith('1-2-3', update);
  });
});
