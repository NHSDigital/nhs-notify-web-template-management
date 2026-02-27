import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import type { LetterVariant } from 'nhs-notify-web-template-management-types';
import { createHandler } from '../../api/get-template-letter-variants';
import type { TemplateClient } from '../../app/template-client';

const makeLetterVariant = (
  overrides: Partial<LetterVariant> = {}
): LetterVariant => ({
  id: 'variant-1',
  name: 'Standard C5',
  sheetSize: 'A4',
  maxSheets: 5,
  bothSides: true,
  printColour: 'black',
  envelopeSize: 'C5',
  dispatchTime: 'standard',
  postage: 'economy',
  status: 'PROD',
  type: 'STANDARD',
  ...overrides,
});

const setup = () => {
  const templateClient = mock<TemplateClient>();

  const handler = createHandler({ templateClient });

  return { handler, mocks: { templateClient } };
};

describe('Template API - Get Template Letter Variants', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test.each([
    ['undefined', undefined],
    ['missing user', { clientId: 'client-id', internalUserId: undefined }],
    ['missing client', { clientId: undefined, internalUserId: 'user-1234' }],
  ])(
    'should return 400 - Invalid request when requestContext is %s',
    async (_, ctx) => {
      const { handler, mocks } = setup();

      const event = mock<APIGatewayProxyEvent>({
        requestContext: { authorizer: ctx },
        pathParameters: { templateId: 'template-1' },
      });

      const result = await handler(event, mock<Context>(), jest.fn());

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          statusCode: 400,
          technicalMessage: 'Invalid request',
        }),
      });

      expect(
        mocks.templateClient.getLetterVariantsForTemplate
      ).not.toHaveBeenCalled();
    }
  );

  test('should return 400 - Invalid request when no templateId', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
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

    expect(
      mocks.templateClient.getLetterVariantsForTemplate
    ).not.toHaveBeenCalled();
  });

  test('should return error when getting template letter variants fails', async () => {
    const { handler, mocks } = setup();

    mocks.templateClient.getLetterVariantsForTemplate.mockResolvedValueOnce({
      error: {
        errorMeta: {
          code: 500,
          description: 'Internal server error',
        },
      },
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
      pathParameters: { templateId: 'template-1' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        statusCode: 500,
        technicalMessage: 'Internal server error',
      }),
    });

    expect(
      mocks.templateClient.getLetterVariantsForTemplate
    ).toHaveBeenCalledWith('template-1', {
      internalUserId: 'user-1234',
      clientId: 'nhs-notify-client-id',
    });
  });

  test('should return template letter variants', async () => {
    const { handler, mocks } = setup();

    const variants = [
      makeLetterVariant({ id: 'variant-1' }),
      makeLetterVariant({ id: 'variant-2' }),
    ];

    mocks.templateClient.getLetterVariantsForTemplate.mockResolvedValueOnce({
      data: variants,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
      pathParameters: { templateId: 'template-1' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, data: variants }),
    });

    expect(
      mocks.templateClient.getLetterVariantsForTemplate
    ).toHaveBeenCalledWith('template-1', {
      internalUserId: 'user-1234',
      clientId: 'nhs-notify-client-id',
    });
  });
});
