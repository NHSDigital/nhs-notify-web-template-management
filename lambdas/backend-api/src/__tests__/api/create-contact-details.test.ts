import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { mock } from 'jest-mock-extended';
import type {
  ContactDetail,
  ContactDetailInput,
} from 'nhs-notify-web-template-management-types';
import { createHandler } from '@backend-api/api/create-contact-details';
import type { ContactDetailsClient } from '@backend-api/app/contact-details-client';

function setup() {
  const contactDetailsClient = mock<ContactDetailsClient>();
  const mocks = { contactDetailsClient };
  const handler = createHandler(mocks);

  return { handler, mocks };
}

describe('Create Contact Details Handler', () => {
  beforeEach(jest.resetAllMocks);

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
        body: JSON.stringify({}),
      });

      const result = await handler(event, mock<Context>(), jest.fn());

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          statusCode: 400,
          technicalMessage: 'Invalid request',
        }),
      });

      expect(mocks.contactDetailsClient.create).not.toHaveBeenCalled();
    }
  );

  test('should return 400 - Invalid request when no body', async () => {
    const { handler, mocks } = setup();

    mocks.contactDetailsClient.create.mockResolvedValueOnce({
      error: {
        errorMeta: {
          code: 400,
          description: 'Validation failed',
          details: {
            type: 'Invalid input: expected string, received undefined',
          },
        },
      },
      data: undefined,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'nhs-notify-client-id',
        },
      },
      body: undefined,
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        technicalMessage: 'Validation failed',
        details: {
          type: 'Invalid input: expected string, received undefined',
        },
      }),
    });

    expect(mocks.contactDetailsClient.create).toHaveBeenCalledWith(
      {},
      { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' }
    );
  });

  test('should return error when create request fails', async () => {
    const { handler, mocks } = setup();

    mocks.contactDetailsClient.create.mockResolvedValueOnce({
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

    expect(mocks.contactDetailsClient.create).toHaveBeenCalledWith(
      { id: 1 },
      { internalUserId: 'user-1234', clientId: 'nhs-notify-client-id' }
    );
  });

  test('should return created contact details', async () => {
    const { handler, mocks } = setup();

    const input: ContactDetailInput = {
      type: 'SMS',
      value: '07890123456',
    };

    const response: ContactDetail = {
      ...input,
      id: 'id',
      status: 'PENDING_VERIFICATION',
    };

    mocks.contactDetailsClient.create.mockResolvedValueOnce({
      data: response,
    });

    const event = mock<APIGatewayProxyEvent>({
      requestContext: {
        authorizer: {
          internalUserId: 'user-1234',
          clientId: 'notify-client-id',
        },
      },
      body: JSON.stringify(input),
    });

    const result = await handler(event, mock<Context>(), jest.fn());

    expect(result).toEqual({
      statusCode: 201,
      body: JSON.stringify({ statusCode: 201, data: response }),
    });

    expect(mocks.contactDetailsClient.create).toHaveBeenCalledWith(input, {
      internalUserId: 'user-1234',
      clientId: 'notify-client-id',
    });
  });
});
