import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import type { RoutingConfig } from 'nhs-notify-web-template-management-types';
import { RoutingConfigRepository } from '../../../infra/routing-config-repository';
import { makeRoutingConfig } from '../../fixtures/routing-config';

jest.mock('nhs-notify-web-template-management-utils/logger');

const TABLE_NAME = 'routing-config-table-name';
const TEMPLATES_TABLE_NAME = 'templates-table-name';

const clientId = '89077697-ca6d-47fc-b233-3281fbd15579';
const clientOwnerKey = `CLIENT#${clientId}`;

const config1 = makeRoutingConfig({ clientId, status: 'DRAFT' });
const config2 = makeRoutingConfig({ clientId, status: 'COMPLETED' });
const config3 = makeRoutingConfig({ clientId, status: 'DELETED' });

function setup() {
  const dynamo = mockClient(DynamoDBDocumentClient);

  const repo = new RoutingConfigRepository(
    // pass an actual doc client - it gets intercepted up by mockClient,
    // but paginateQuery needs the real deal
    DynamoDBDocumentClient.from(new DynamoDBClient({})),
    TABLE_NAME,
    TEMPLATES_TABLE_NAME
  );

  const mocks = { dynamo };

  return { mocks, repo };
}

describe('RoutingConfigRepo#query', () => {
  describe('list', () => {
    test('queries by owner, paginates across pages, returns all items', async () => {
      const { repo, mocks } = setup();

      const page1: RoutingConfig[] = [config1, config2];
      const page2: RoutingConfig[] = [config3];

      mocks.dynamo
        .on(QueryCommand)
        .resolvesOnce({
          Items: page1,
          LastEvaluatedKey: { owner: clientOwnerKey, id: config2.id },
        })
        .resolvesOnce({
          Items: page2,
        });

      const result = await repo.query(clientId).list();

      expect(mocks.dynamo).toHaveReceivedCommandTimes(QueryCommand, 2);
      expect(mocks.dynamo).toHaveReceivedNthCommandWith(1, QueryCommand, {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#owner = :owner',
        ExpressionAttributeNames: {
          '#owner': 'owner',
        },
        ExpressionAttributeValues: {
          ':owner': clientOwnerKey,
        },
        ExclusiveStartKey: { owner: clientOwnerKey, id: config2.id },
      });
      expect(mocks.dynamo).toHaveReceivedNthCommandWith(2, QueryCommand, {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#owner = :owner',
        ExpressionAttributeNames: {
          '#owner': 'owner',
        },
        ExpressionAttributeValues: {
          ':owner': clientOwnerKey,
        },
      });

      expect(result.data).toEqual([config1, config2, config3]);
    });

    test('supports filtering by status (chainable)', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(QueryCommand).resolvesOnce({
        Items: [],
      });

      await repo
        .query(clientId)
        .status('COMPLETED', 'DELETED')
        .status('DRAFT')
        .list();

      expect(mocks.dynamo).toHaveReceivedCommandTimes(QueryCommand, 1);
      expect(mocks.dynamo).toHaveReceivedCommandWith(QueryCommand, {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#owner = :owner',
        FilterExpression: '(#status IN (:status0, :status1, :status2))',
        ExpressionAttributeNames: {
          '#owner': 'owner',
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':owner': clientOwnerKey,
          ':status0': 'COMPLETED',
          ':status1': 'DELETED',
          ':status2': 'DRAFT',
        },
      });
    });

    test('supports excluding statuses (chainable)', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(QueryCommand).resolvesOnce({
        Items: [],
      });

      await repo
        .query(clientId)
        .excludeStatus('COMPLETED', 'DELETED')
        .excludeStatus('DRAFT')
        .list();

      expect(mocks.dynamo).toHaveReceivedCommandTimes(QueryCommand, 1);
      expect(mocks.dynamo).toHaveReceivedCommandWith(QueryCommand, {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#owner = :owner',
        FilterExpression:
          'NOT(#status IN (:notstatus0, :notstatus1, :notstatus2))',
        ExpressionAttributeNames: {
          '#owner': 'owner',
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':owner': clientOwnerKey,
          ':notstatus0': 'COMPLETED',
          ':notstatus1': 'DELETED',
          ':notstatus2': 'DRAFT',
        },
      });
    });

    test('supports mixed filters', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(QueryCommand).resolvesOnce({
        Items: [],
      });

      await repo
        .query(clientId)
        .status('DRAFT')
        .excludeStatus('DELETED')
        .list();

      expect(mocks.dynamo).toHaveReceivedCommandTimes(QueryCommand, 1);
      expect(mocks.dynamo).toHaveReceivedCommandWith(QueryCommand, {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#owner = :owner',
        FilterExpression:
          '(#status IN (:status0)) AND NOT(#status IN (:notstatus0))',
        ExpressionAttributeNames: {
          '#owner': 'owner',
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':owner': clientOwnerKey,
          ':notstatus0': 'DELETED',
          ':status0': 'DRAFT',
        },
      });
    });

    test('dedupes status filters', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(QueryCommand).resolvesOnce({
        Items: [],
      });

      await repo
        .query(clientId)
        .status('DRAFT')
        .status('DRAFT')
        .excludeStatus('DELETED')
        .excludeStatus('DELETED')
        .list();

      expect(mocks.dynamo).toHaveReceivedCommandTimes(QueryCommand, 1);
      expect(mocks.dynamo).toHaveReceivedCommandWith(QueryCommand, {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#owner = :owner',
        FilterExpression:
          '(#status IN (:status0)) AND NOT(#status IN (:notstatus0))',
        ExpressionAttributeNames: {
          '#owner': 'owner',
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':owner': clientOwnerKey,
          ':notstatus0': 'DELETED',
          ':status0': 'DRAFT',
        },
      });
    });

    test('filters out invalid routing config items', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(QueryCommand).resolvesOnce({
        Items: [
          config1,
          { owner: clientOwnerKey, id: '2eb0b8f5-63f0-4512-8a95-5b82e7c4b07b' },
          config2,
        ],
      });

      const result = await repo.query(clientId).list();

      expect(result.data).toEqual([config1, config2]);
    });

    test('handles no items from dynamo', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(QueryCommand).resolvesOnce({});

      const result = await repo.query(clientId).list();

      expect(result.data).toEqual([]);
    });

    test('handles exceptions from dynamodb', async () => {
      const { repo, mocks } = setup();

      const e = new Error('oh no');

      mocks.dynamo.on(QueryCommand).rejectsOnce(e);

      const result = await repo.query(clientId).list();

      expect(result.error).toMatchObject({
        actualError: e,
        errorMeta: expect.objectContaining({ code: 500 }),
      });
      expect(result.data).toBeUndefined();
    });
  });

  describe('count', () => {
    test('queries by owner, paginates across pages, returns count of items', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo
        .on(QueryCommand)
        .resolvesOnce({
          Count: 2,
          LastEvaluatedKey: { owner: clientOwnerKey, id: config2.id },
        })
        .resolvesOnce({
          Count: 1,
        });

      const result = await repo.query(clientId).count();

      expect(mocks.dynamo).toHaveReceivedCommandTimes(QueryCommand, 2);
      expect(mocks.dynamo).toHaveReceivedNthCommandWith(1, QueryCommand, {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#owner = :owner',
        ExpressionAttributeNames: {
          '#owner': 'owner',
        },
        ExpressionAttributeValues: {
          ':owner': clientOwnerKey,
        },
        Select: 'COUNT',
        ExclusiveStartKey: { owner: clientOwnerKey, id: config2.id },
      });
      expect(mocks.dynamo).toHaveReceivedNthCommandWith(2, QueryCommand, {
        TableName: TABLE_NAME,
        KeyConditionExpression: '#owner = :owner',
        ExpressionAttributeNames: {
          '#owner': 'owner',
        },
        ExpressionAttributeValues: {
          ':owner': clientOwnerKey,
        },
        Select: 'COUNT',
      });

      expect(result.data).toEqual({ count: 3 });
    });

    test('handles no items from dynamo', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(QueryCommand).resolvesOnce({});

      const result = await repo.query(clientId).count();

      expect(result.data).toEqual({ count: 0 });
    });

    test('handles exceptions from dynamodb', async () => {
      const { repo, mocks } = setup();

      const e = new Error('oh no');

      mocks.dynamo.on(QueryCommand).rejectsOnce(e);

      const result = await repo.query(clientId).count();

      expect(result.error).toMatchObject({
        actualError: e,
        errorMeta: expect.objectContaining({ code: 500 }),
      });
      expect(result.data).toBeUndefined();
    });
  });
});
