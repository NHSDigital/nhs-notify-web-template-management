import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import { ZodError } from 'zod';
import { RoutingConfigRepository } from '@backend-api/templates/infra/routing-config-repository';
import { routingConfig } from '../../fixtures/routing-config';

const TABLE_NAME = 'routing-config-table-name';

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
        'nhs-notify-client-id'
      );

      expect(result).toEqual({ data: routingConfig });

      expect(mocks.dynamo).toHaveReceivedCommandWith(GetCommand, {
        TableName: TABLE_NAME,
        Key: {
          id: 'b9b6d56b-421e-462f-9ce5-3012e3fdb27f',
          owner: 'nhs-notify-client-id',
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
        'nhs-notify-client-id'
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
          owner: 'nhs-notify-client-id',
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
        'nhs-notify-client-id'
      );

      expect(result.error).toMatchObject({
        actualError: expect.any(ZodError),
        errorMeta: expect.objectContaining({
          code: 500,
        }),
      });
      expect(result.data).toBeUndefined();

      expect(mocks.dynamo).toHaveReceivedCommandWith(GetCommand, {
        TableName: TABLE_NAME,
        Key: {
          id: 'b9b6d56b-421e-462f-9ce5-3012e3fdb27f',
          owner: 'nhs-notify-client-id',
        },
      });
    });

    test('returns errors if the database call fails', async () => {
      const { repo, mocks } = setup();

      const e = new Error('Oh No');

      mocks.dynamo.on(GetCommand).rejectsOnce(e);

      const result = await repo.get(
        'b9b6d56b-421e-462f-9ce5-3012e3fdb27f',
        'nhs-notify-client-id'
      );

      expect(result.error).toMatchObject({
        actualError: e,
        errorMeta: expect.objectContaining({
          code: 500,
        }),
      });

      expect(result.data).toBeUndefined();
    });
  });
});
