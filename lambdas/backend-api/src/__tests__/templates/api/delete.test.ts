import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import { createHandler } from '@backend-api/templates/api/delete';
import { TemplateClient } from '@backend-api/templates/app/template-client';

const setup = () => {
  const templateClient = mock<TemplateClient>();

  const handler = createHandler({ templateClient });

  return { handler, mocks: { templateClient } };
};

describe('Template API - Delete', () => {
  beforeEach(jest.resetAllMocks);

  test('should return 400 - Invalid request when, no user in requestContext', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { user: undefined } },
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

    expect(mocks.templateClient.deleteTemplate).not.toHaveBeenCalled();
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

    expect(mocks.templateClient.deleteTemplate).not.toHaveBeenCalled();
  });

  test('should return error when deleting template fails', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.deleteTemplate.mockResolvedValueOnce({
      error: {
        code: 500,
        message: 'Internal server error',
      },
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { user: 'sub' } },
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

    expect(mocks.templateClient.deleteTemplate).toHaveBeenCalledWith(
      '1-2-3',
      'sub'
    );
  });

  test('should return no content', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.deleteTemplate.mockResolvedValueOnce({
      data: undefined,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: { authorizer: { user: 'sub' } },
      pathParameters: { templateId: '1-2-3' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 204,
      body: JSON.stringify({ statusCode: 204, template: undefined }),
    });

    expect(mocks.templateClient.deleteTemplate).toHaveBeenCalledWith(
      '1-2-3',
      'sub'
    );
  });
});
