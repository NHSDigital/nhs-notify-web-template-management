import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import { createHandler } from '../../api/proof';
import { TemplateClient } from '../../app/template-client';
import { LetterTemplate } from 'nhs-notify-web-template-management-utils';

const setup = () => {
  const templateClient = mock<TemplateClient>();

  const handler = createHandler({ templateClient });

  return { handler, mocks: { templateClient } };
};

describe('Template API - request proof', () => {
  beforeEach(jest.resetAllMocks);

  test.each([
    ['undefined', undefined],
    ['missing clientId', { userId: 'user-id', clientId: undefined }],
    ['missing user', { clientId: 'client-id', user: undefined }],
  ])(
    'should return 400 - Invalid request when requestContext is %s',
    async (_, ctx) => {
      const { handler, mocks } = setup();

      const event = mock<APIGatewayProxyEvent>({
        requestContext: { authorizer: ctx },
        pathParameters: { templateId: 'id' },
        headers: { 'X-Lock-Number': '0' },
      });

      const result = await handler(event, mock<Context>(), jest.fn());

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          statusCode: 400,
          technicalMessage: 'Invalid request',
        }),
      });

      expect(mocks.templateClient.requestProof).not.toHaveBeenCalled();
    }
  );

  test('should return 400 - Invalid request when, no templateId', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
      },
      pathParameters: { templateId: undefined },
      headers: { 'X-Lock-Number': '0' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        technicalMessage: 'Invalid request',
      }),
    });

    expect(mocks.templateClient.requestProof).not.toHaveBeenCalled();
  });

  test('should return error when requesting proof fails', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.requestProof.mockResolvedValueOnce({
      error: {
        errorMeta: {
          code: 500,
          description: 'Internal server error',
        },
      },
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
      },
      pathParameters: { templateId: 'template-id' },
      headers: { 'X-Lock-Number': '0' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        statusCode: 500,
        technicalMessage: 'Internal server error',
      }),
    });

    expect(mocks.templateClient.requestProof).toHaveBeenCalledWith(
      'template-id',
      { userId: 'sub', clientId: 'nhs-notify-client-id' },
      '0'
    );
  });

  test('should coerce missing lock number header to empty string', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.requestProof.mockResolvedValueOnce({
      error: {
        errorMeta: {
          code: 409,
          description:
            'Lock number mismatch - Template has been modified since last read',
        },
      },
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'nhs-notify-client-id' },
      },
      pathParameters: { templateId: 'template-id' },
      headers: {},
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 409,
      body: JSON.stringify({
        statusCode: 409,
        technicalMessage:
          'Lock number mismatch - Template has been modified since last read',
      }),
    });

    expect(mocks.templateClient.requestProof).toHaveBeenCalledWith(
      'template-id',
      { userId: 'sub', clientId: 'nhs-notify-client-id' },
      ''
    );
  });

  test('should return template', async () => {
    const { handler, mocks } = setup();

    const response: LetterTemplate = {
      id: 'id',
      templateType: 'LETTER',
      templateStatus: 'WAITING_FOR_PROOF',
      name: 'template-name',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
      lockNumber: 1,
      letterType: 'q4',
      language: 'fr',
      files: {
        pdfTemplate: {
          fileName: 'file.pdf',
          currentVersion: '61C1267A-0F37-4E1D-831E-494DE2BECC8C',
          virusScanStatus: 'PASSED',
        },
        testDataCsv: {
          fileName: 'file.csv',
          currentVersion: 'A8A76934-70F4-4735-8314-51CE097130DB',
          virusScanStatus: 'PASSED',
        },
      },
    };

    mocks.templateClient.requestProof.mockResolvedValueOnce({
      data: response,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: { user: 'sub', clientId: 'notify-client-id' },
      },
      pathParameters: { templateId: 'id' },
      headers: { 'X-Lock-Number': '0' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, data: response }),
    });

    expect(mocks.templateClient.requestProof).toHaveBeenCalledWith(
      'id',
      {
        userId: 'sub',
        clientId: 'notify-client-id',
      },
      '0'
    );
  });
});
