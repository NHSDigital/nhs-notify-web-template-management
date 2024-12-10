import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import {
  TemplateDTO,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-backend-client';
import { handler } from '@backend-api/templates/api/list';
import { TemplateClient } from '@backend-api/templates/app/template-client';

jest.mock('@backend-api/templates/app/template-client');

const listTemplatesMock = jest.spyOn(TemplateClient.prototype, 'listTemplates');

describe('Template API - List', () => {
  beforeEach(jest.resetAllMocks);

  test('should return 400 - Invalid request when, no email in requestContext', async () => {
    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { email: undefined } },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        technicalMessage: 'Invalid request',
      }),
    });

    expect(listTemplatesMock).not.toHaveBeenCalled();
  });

  test('should return error when listing templates fails', async () => {
    listTemplatesMock.mockResolvedValueOnce({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { email: 'email' } },
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

    expect(TemplateClient).toHaveBeenCalledWith('email');

    expect(listTemplatesMock).toHaveBeenCalled();
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

    listTemplatesMock.mockResolvedValueOnce({
      data: [template],
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { email: 'email' } },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, templates: [template] }),
    });

    expect(TemplateClient).toHaveBeenCalledWith('email');

    expect(listTemplatesMock).toHaveBeenCalled();
  });
});
