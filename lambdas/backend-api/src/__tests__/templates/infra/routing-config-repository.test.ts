import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import { RoutingConfigRepository } from '@backend-api/templates/infra/routing-config-repository';
import { routingConfig } from '../fixtures/routing-config';
import {
  CreateUpdateRoutingConfig,
  RoutingConfig,
} from 'nhs-notify-backend-client';

jest.mock('node:crypto', () => ({ randomUUID: () => 'id' }));

const date = new Date(2024, 11, 27);

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(date);
});

const TABLE_NAME = 'routing-config-table-name';
const user = { userId: 'user', clientId: 'nhs-notify-client-id' };

function setup() {
  const dynamo = mockClient(DynamoDBDocumentClient);

  const mocks = { dynamo };

  const repo = new RoutingConfigRepository(
    dynamo as unknown as DynamoDBDocumentClient,
    TABLE_NAME
  );

  return { repo, mocks };
}

describe('RoutingConfigRepository', () => {
  describe('get', () => {
    test('returns the routing config data from the database', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(GetCommand).resolvesOnce({
        Item: routingConfig,
      });

      const result = await repo.get(
        'b9b6d56b-421e-462f-9ce5-3012e3fdb27f',
        user
      );

      expect(result).toEqual({ data: routingConfig });

      expect(mocks.dynamo).toHaveReceivedCommandWith(GetCommand, {
        TableName: TABLE_NAME,
        Key: {
          id: 'b9b6d56b-421e-462f-9ce5-3012e3fdb27f',
          owner: `CLIENT#${user.clientId}`,
        },
      });
    });

    test('returns error result if the database returns no data', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(GetCommand).resolvesOnce({
        Item: undefined,
      });

      const result = await repo.get(
        'b9b6d56b-421e-462f-9ce5-3012e3fdb27f',
        user
      );

      expect(result).toEqual({
        error: {
          errorMeta: { code: 404, description: 'Routing Config not found' },
        },
      });

      expect(mocks.dynamo).toHaveReceivedCommandWith(GetCommand, {
        TableName: TABLE_NAME,
        Key: {
          id: 'b9b6d56b-421e-462f-9ce5-3012e3fdb27f',
          owner: `CLIENT#${user.clientId}`,
        },
      });
    });

    test('returns errors if the database item cannot be parsed', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(GetCommand).resolvesOnce({
        Item: {},
      });

      const result = await repo.get(
        'b9b6d56b-421e-462f-9ce5-3012e3fdb27f',
        user
      );

      expect(result.error).not.toBeUndefined();
      expect(result.data).toBeUndefined();

      expect(mocks.dynamo).toHaveReceivedCommandWith(GetCommand, {
        TableName: TABLE_NAME,
        Key: {
          id: 'b9b6d56b-421e-462f-9ce5-3012e3fdb27f',
          owner: `CLIENT#${user.clientId}`,
        },
      });
    });
  });

  describe('create', () => {
    const input: CreateUpdateRoutingConfig = {
      name: 'rc',
      campaignId: 'campaign',
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'SMS',
          channelType: 'primary',
          defaultTemplateId: 'sms',
        },
      ],
      cascadeGroupOverrides: [{ name: 'standard' }],
    };

    const rc: RoutingConfig = {
      ...input,
      clientId: user.clientId,
      createdAt: date.toISOString(),
      id: 'id',
      status: 'DRAFT',
      updatedAt: date.toISOString(),
    };

    const putPayload = {
      ...rc,
      owner: `CLIENT#${user.clientId}`,
      createdBY: user.userId,
      updatedBy: user.userId,
    };

    test('should create routing config', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo
        .on(PutCommand, {
          TableName: TABLE_NAME,
          Item: putPayload,
        })
        .resolves({});

      const result = await repo.create(input, user);

      expect(result).toEqual({ data: rc });
    });

    test('returns failure if put fails', async () => {
      const { repo, mocks } = setup();

      const err = new Error('ddb_err');

      mocks.dynamo.on(PutCommand).rejects(err);

      const result = await repo.create(input, user);

      expect(result).toEqual({
        error: {
          actualError: err,
          errorMeta: {
            code: 500,
            description: 'Failed to create routing config',
          },
        },
      });
    });
  });
});
