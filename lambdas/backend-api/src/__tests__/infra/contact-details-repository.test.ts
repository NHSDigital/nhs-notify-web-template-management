import crypto from 'node:crypto';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import type { ContactDetailInputNormalized } from 'nhs-notify-web-template-management-types';
import type { User } from 'nhs-notify-web-template-management-utils';
import { hashContactDetailsOtp } from '@backend-api/domain/hash-contact-details-otp';
import { ContactDetailsRepository } from '@backend-api/infra/contact-details-repository';

jest.mock('@backend-api/domain/hash-contact-details-otp');

const RANDOM_UUID = 'omg-so-totally-like-random';
const TABLE_NAME = 'client-details-table';
const SECRET_PATH = '/path/to/secret/parameter';
const SECRET_VALUE = 'super_secret';

const USER: User = {
  internalUserId: 'user-id',
  clientId: 'client-id',
};

const OTP = '123456';

const NOW = new Date('2026-04-07T11:07:08.490Z');
const UNVERIFIED_TTL_SECONDS = 300;
const EXPECTED_TTL = 1_775_560_328;

const FAKE_HASH = 'fake-otp-hash';

beforeEach(() => {
  jest.useFakeTimers({
    now: NOW,
  });
  jest.spyOn(crypto, 'randomUUID').mockReturnValue(RANDOM_UUID);
  jest.mocked(hashContactDetailsOtp).mockReturnValue(FAKE_HASH);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

function setup() {
  const dynamodb = mockClient(DynamoDBDocumentClient);
  const ssm = mockClient(SSMClient);

  ssm.on(GetParameterCommand).resolvesOnce({
    Parameter: {
      Value: SECRET_VALUE,
    },
  });

  const repo = new ContactDetailsRepository(
    dynamodb as unknown as DynamoDBDocumentClient,
    ssm as unknown as SSMClient,
    TABLE_NAME,
    UNVERIFIED_TTL_SECONDS,
    SECRET_PATH
  );

  return {
    repo,
    mocks: {
      dynamodb,
      ssm,
    },
  };
}

describe('ContactDetailsRepository', () => {
  describe('putContactDetail', () => {
    it.each([
      {
        type: 'EMAIL',
        value: 'email@nhs.net',
        rawValue: ' EMAIL@NHS.NET ',
      },
      {
        type: 'SMS',
        value: '+447890123456',
        rawValue: '07890 123 456',
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

        expect(mocks.ssm).toHaveReceivedCommandWith(GetParameterCommand, {
          Name: SECRET_PATH,
          WithDecryption: true,
        });

        expect(hashContactDetailsOtp).toHaveBeenCalledWith(
          result.data,
          OTP,
          SECRET_VALUE
        );

        expect(mocks.dynamodb).toHaveReceivedCommandWith(PutCommand, {
          TableName: TABLE_NAME,
          Item: {
            owner: `INTERNAL_USER#${USER.internalUserId}`,
            contactDetailKey: `${input.type}#${input.value}`,
            createdAt: NOW.toISOString(),
            createdBy: `INTERNAL_USER#${USER.internalUserId}`,
            clientId: USER.clientId,
            id: RANDOM_UUID,
            otpHash: FAKE_HASH,
            rawValue: input.rawValue,
            status: 'PENDING_VERIFICATION',
            ttl: EXPECTED_TTL,
            type: input.type,
            updatedAt: NOW.toISOString(),
            updatedBy: `INTERNAL_USER#${USER.internalUserId}`,
            value: input.value,
          },
          ExpressionAttributeNames: { '#owner': 'owner', '#status': 'status' },
          ExpressionAttributeValues: { ':statusVerified': 'VERIFIED' },
          ConditionExpression:
            'attribute_not_exists(#owner) OR #status <> :statusVerified',
        });
      }
    );

    it('does not re-fetch secret from SSM after initial fetch', async () => {
      const { repo, mocks } = setup();

      await repo.putContactDetail(
        {
          type: 'EMAIL',
          value: 'email@nhs.net',
          rawValue: 'email@nhs.net',
        },
        OTP,
        USER
      );

      await repo.putContactDetail(
        {
          type: 'SMS',
          value: '+447890123456',
          rawValue: '07890 123 456',
        },
        OTP,
        USER
      );

      expect(mocks.ssm).toHaveReceivedCommandTimes(GetParameterCommand, 1);
    });

    it('returns internal error result if ssm call fails', async () => {
      const { repo, mocks } = setup();

      mocks.ssm.on(GetParameterCommand).rejectsOnce(new Error('oh no'));

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

    it('returns internal error result if ssm call returns no parameter', async () => {
      const { repo, mocks } = setup();

      mocks.ssm.on(GetParameterCommand).resolvesOnce({});

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

    it('returns internal error result if ssm call returns empty parameter', async () => {
      const { repo, mocks } = setup();

      mocks.ssm.on(GetParameterCommand).resolvesOnce({
        Parameter: {
          Value: '',
        },
      });

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
