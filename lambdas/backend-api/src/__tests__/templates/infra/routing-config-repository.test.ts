import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import { RoutingConfigRepository } from '@backend-api/templates/infra/routing-config-repository';

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

      const routingConfig = {
        id: '3690d344-731f-4f60-9047-2c63c96623a2',
        owner: 'nhs-notify-client-id',
        status: 'DRAFT',
      };

      mocks.dynamo.on(GetCommand).resolvesOnce({
        Item: routingConfig,
      });

      const result = await repo.get(
        '3690d344-731f-4f60-9047-2c63c96623a2',
        'nhs-notify-client-id'
      );

      expect(result).toEqual({ data: routingConfig });

      expect(mocks.dynamo).toHaveReceivedCommandWith(GetCommand, {
        TableName: TABLE_NAME,
        Key: {
          id: '3690d344-731f-4f60-9047-2c63c96623a2',
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
        '3690d344-731f-4f60-9047-2c63c96623a2',
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
          id: '3690d344-731f-4f60-9047-2c63c96623a2',
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
        '3690d344-731f-4f60-9047-2c63c96623a2',
        'nhs-notify-client-id'
      );

      expect(result).toMatchSnapshot();

      expect(mocks.dynamo).toHaveReceivedCommandWith(GetCommand, {
        TableName: TABLE_NAME,
        Key: {
          id: '3690d344-731f-4f60-9047-2c63c96623a2',
          owner: 'nhs-notify-client-id',
        },
      });
    });
  });
});
