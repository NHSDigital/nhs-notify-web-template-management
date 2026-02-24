import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import type { LetterVariant } from 'nhs-notify-backend-client';
import { createHandler } from '../../api/get-letter-variant';
import { LetterVariantClient } from '../../app/letter-variant-client';

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
  const letterVariantClient = mock<LetterVariantClient>();

  const handler = createHandler({ letterVariantClient });

  return { handler, mocks: { letterVariantClient } };
};

describe('Letter Variant API - Get', () => {
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
        pathParameters: { letterVariantId: 'variant-1' },
      });

      const result = await handler(event, mock<Context>(), jest.fn());

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          statusCode: 400,
          technicalMessage: 'Invalid request',
        }),
      });

      expect(mocks.letterVariantClient.get).not.toHaveBeenCalled();
    }
  );

  test('should return 400 - Invalid request when no letterVariantId path parameter', async () => {
    const { handler, mocks } = setup();

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
      pathParameters: {
        letterVariantId: undefined,
      },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        technicalMessage: 'Invalid request',
      }),
    });

    expect(mocks.letterVariantClient.get).not.toHaveBeenCalled();
  });

  test('should return error when getting letter variant fails', async () => {
    const { handler, mocks } = setup();

    mocks.letterVariantClient.get.mockResolvedValueOnce({
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
      pathParameters: { letterVariantId: 'variant-1' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        statusCode: 500,
        technicalMessage: 'Internal server error',
      }),
    });

    expect(mocks.letterVariantClient.get).toHaveBeenCalledWith('variant-1', {
      internalUserId: 'user-1234',
      clientId: 'nhs-notify-client-id',
    });
  });

  test('should return letter variant', async () => {
    const { handler, mocks } = setup();

    const variant = makeLetterVariant();

    mocks.letterVariantClient.get.mockResolvedValueOnce({
      data: variant,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
      pathParameters: { letterVariantId: 'variant-1' },
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, data: variant }),
    });

    expect(mocks.letterVariantClient.get).toHaveBeenCalledWith('variant-1', {
      internalUserId: 'user-1234',
      clientId: 'nhs-notify-client-id',
    });
  });
});
