import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import type { ContactDetailInputNormalized } from 'nhs-notify-web-template-management-types';
import type { User } from 'nhs-notify-web-template-management-utils';
import { ContactDetailsRepository } from '@backend-api/infra/contact-details-repository';

const RANDOM_UUID = 'omg-so-random';

jest.mock('node:crypto', () => {
  const crypto = jest.requireActual('node:crypto');
  return {
    ...crypto,
    randomUUID: () => RANDOM_UUID,
  };
});

const TABLE_NAME = 'client-details-table';

const USER: User = {
  internalUserId: 'user-id',
  clientId: 'client-id',
};

const OTP = '1234';
const EXPECTED_OTP_HASH =
  '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';

const NOW = new Date('2026-04-07T11:07:08.490Z');
const UNVERIFIED_TTL_SECONDS = 300;
const EXPECTED_TTL = 1_775_560_328;

beforeEach(() => {
  jest.useFakeTimers({
    now: NOW,
  });
});

afterEach(() => {
  jest.useRealTimers();
});

function setup() {
  const dynamodb = mockClient(DynamoDBDocumentClient);

  const repo = new ContactDetailsRepository(
    dynamodb as unknown as DynamoDBDocumentClient,
    TABLE_NAME,
    UNVERIFIED_TTL_SECONDS
  );

  return {
    repo,
    mocks: {
      dynamodb,
    },
  };
}

describe('ContactDetailsRepository', () => {
  describe('putContactDetail', () => {
    it.each([
      {
        type: 'EMAIL',
        value: 'email@nhs.net',
        rawValue: ' EMAIL@NET.NET ',
      },
      {
        type: 'SMS',
        value: '+447812817307',
        rawValue: '07812 817 307',
      },
    ] as ContactDetailInputNormalized[])(
      'saves the $type item in DynamoDB',
      async (input) => {
        const { repo, mocks } = setup();

        const result = await repo.putContactDetail(input, OTP, USER);

        expect(result).toEqual({
          data: {
            id: RANDOM_UUID,
            status: 'PENDING_VERIFICATION',
            type: input.type,
            value: input.value,
          },
        });

        expect(mocks.dynamodb).toHaveReceivedCommandWith(PutCommand, {
          TableName: TABLE_NAME,
          Item: {
            PK: `CLIENT#${USER.clientId}`,
            SK: `${input.type}#${input.value}`,
            createdAt: NOW.toISOString(),
            createdBy: USER.internalUserId,
            id: RANDOM_UUID,
            otpHash: EXPECTED_OTP_HASH,
            rawValue: input.rawValue,
            status: 'PENDING_VERIFICATION',
            ttl: EXPECTED_TTL,
            type: input.type,
            updatedAt: NOW.toISOString(),
            updatedBy: USER.internalUserId,
            value: input.value,
          },
          ExpressionAttributeNames: { '#pk': 'PK', '#status': 'status' },
          ExpressionAttributeValues: { ':statusVerified': 'VERIFIED' },
          ConditionExpression:
            'attribute_not_exists(#pk) OR #status <> :statusVerified',
        });
      }
    );

    it('returns a conflict error result if a conditional check exception occurs', async () => {
      const { repo, mocks } = setup();

      mocks.dynamodb.on(PutCommand).rejects(
        new ConditionalCheckFailedException({
          message: 'Oh no',
          $metadata: {},
        })
      );

      const result = await repo.putContactDetail(
        {
          type: 'EMAIL',
          value: 'email@nhs.net',
          rawValue: 'email@nhs.net',
        },
        OTP,
        USER
      );

      expect(result.data).toBeUndefined();
      expect(result.error?.errorMeta.code).toBe(409);
      expect(result.error?.errorMeta.description).toBe(
        'Contact details already verified.'
      );
    });

    it('returns an internal error result if write fails', async () => {
      const { repo, mocks } = setup();

      mocks.dynamodb.on(PutCommand).rejects(new Error('Oh no'));

      const result = await repo.putContactDetail(
        {
          type: 'EMAIL',
          value: 'email@nhs.net',
          rawValue: 'email@nhs.net',
        },
        OTP,
        USER
      );

      expect(result.data).toBeUndefined();
      expect(result.error?.errorMeta.code).toBe(500);
      expect(result.error?.errorMeta.description).toBe(
        'Failed to save contact details.'
      );
    });
  });
});
