import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import {
  TemplateDTO,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-backend-client';
import { handler } from '@backend-api/templates/api/get';
import { TemplateClient } from '@backend-api/templates/app/template-client';

jest.mock('@backend-api/templates/app/template-client');

const getTemplateMock = jest.spyOn(TemplateClient.prototype, 'getTemplate');

const OLD_ENV = { ...process.env };

describe('Template API - Get', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.ENABLE_LETTERS_BACKEND = 'true';
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('should return 400 - Invalid request when, no user in requestContext', async () => {
    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { user: undefined } },
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

    expect(getTemplateMock).not.toHaveBeenCalled();
  });

  test('should return 400 - Invalid request when, no templateId', async () => {
    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { user: 'sub' } },
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

    expect(getTemplateMock).not.toHaveBeenCalled();
  });

  test('should return error when getting template fails', async () => {
    getTemplateMock.mockResolvedValueOnce({
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

    expect(TemplateClient).toHaveBeenCalledWith('sub', true);
    expect(getTemplateMock).toHaveBeenCalledWith('1');
  });

  test('creates template client with letter flag value', async () => {
    process.env.ENABLE_LETTERS_BACKEND = 'false';

    getTemplateMock.mockResolvedValueOnce({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });

    await handler(
      mock<APIGatewayProxyEvent>({
        requestContext: { authorizer: { user: 'sub' } },
        pathParameters: { templateId: '1' },
      }),
      mock<Context>(),
      jest.fn()
    );

    expect(TemplateClient).toHaveBeenCalledWith('sub', false);
  });

  test('should return template', async () => {
    const template: TemplateDTO = {
      id: 'id',
      templateType: TemplateType.EMAIL,
      name: 'name',
      message: 'message',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    };

    getTemplateMock.mockResolvedValueOnce({
      data: template,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { user: 'sub' } },
      pathParameters: { templateId: '1' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, template }),
    });

    expect(TemplateClient).toHaveBeenCalledWith('sub', true);
    expect(getTemplateMock).toHaveBeenCalledWith('1');
  });
});
