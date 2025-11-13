import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import { ZodError } from 'zod';
import { RoutingConfigRepository } from '../../../infra/routing-config-repository';
import { routingConfig } from '../../fixtures/routing-config';
import {
  CreateRoutingConfig,
  RoutingConfig,
  RoutingConfigStatus,
  UpdateRoutingConfig,
} from 'nhs-notify-backend-client';
import { randomUUID, type UUID } from 'node:crypto';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';

jest.mock('node:crypto');
const uuidMock = jest.mocked(randomUUID);
const generatedId = 'c4846505-5380-4601-a361-f82f650adfee';
uuidMock.mockReturnValue(generatedId);

const date = new Date(2024, 11, 27);

const mockTtl = 1000;

jest.mock('@backend-api/utils/calculate-ttl', () => ({
  calculateTTL: () => mockTtl,
}));

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(date);
});

const TABLE_NAME = 'routing-config-table-name';
const user = { userId: 'user', clientId: 'nhs-notify-client-id' };
const clientOwnerKey = `CLIENT#${user.clientId}`;

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
        user.clientId
      );

      expect(result).toEqual({ data: routingConfig });

      expect(mocks.dynamo).toHaveReceivedCommandWith(GetCommand, {
        TableName: TABLE_NAME,
        Key: {
          id: 'b9b6d56b-421e-462f-9ce5-3012e3fdb27f',
          owner: clientOwnerKey,
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
        user.clientId
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
          owner: clientOwnerKey,
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
        user.clientId
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
          owner: clientOwnerKey,
        },
      });
    });
  });

  describe('create', () => {
    const input: CreateRoutingConfig = {
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
      id: generatedId,
      status: 'DRAFT',
      updatedAt: date.toISOString(),
    };

    const putPayload = {
      ...rc,
      owner: clientOwnerKey,
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

    test('returns failure if constructed routing config is invalid', async () => {
      const { repo } = setup();

      uuidMock.mockReturnValueOnce('not_a_uuid' as UUID);

      const result = await repo.create(input, user);

      expect(result).toEqual({
        error: {
          actualError: expect.objectContaining({
            issues: expect.arrayContaining([
              expect.objectContaining({
                path: ['id'],
                code: 'invalid_format',
                format: 'uuid',
              }),
            ]),
          }),
          errorMeta: {
            code: 500,
            description: 'Failed to create routing config',
          },
        },
      });
    });
  });

  describe('submit', () => {
    test('updates routing config to COMPLETED', async () => {
      const { repo, mocks } = setup();

      const completed: RoutingConfig = {
        ...routingConfig,
        status: 'COMPLETED',
      };

      mocks.dynamo.on(UpdateCommand).resolves({ Attributes: completed });

      const result = await repo.submit(routingConfig.id, user);

      expect(result).toEqual({ data: completed });

      expect(mocks.dynamo).toHaveReceivedCommandWith(UpdateCommand, {
        ConditionExpression: '#status = :condition_1_status',
        ExpressionAttributeNames: {
          '#status': 'status',
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy',
        },
        ExpressionAttributeValues: {
          ':condition_1_status': 'DRAFT',
          ':status': 'COMPLETED',
          ':updatedAt': date.toISOString(),
          ':updatedBy': user.userId,
        },
        Key: {
          id: routingConfig.id,
          owner: clientOwnerKey,
        },
        ReturnValues: 'ALL_NEW',
        TableName: TABLE_NAME,
        UpdateExpression:
          'SET #status = :status, #updatedAt = :updatedAt, #updatedBy = :updatedBy',
      });
    });

    test('returns failure on client error', async () => {
      const { repo, mocks } = setup();

      const err = new Error('ddb err');

      mocks.dynamo.on(UpdateCommand).rejects(err);

      const result = await repo.submit(routingConfig.id, user);

      expect(result).toEqual({
        error: {
          actualError: err,
          errorMeta: {
            code: 500,
            description: 'Failed to update routing config',
          },
        },
      });
    });

    test('returns failure if updated template is invalid', async () => {
      const { repo, mocks } = setup();

      const completedInvalid: RoutingConfig = {
        ...routingConfig,
        status: 'COMPLETED',
        name: 0 as unknown as string,
      };

      mocks.dynamo.on(UpdateCommand).resolves({ Attributes: completedInvalid });

      const result = await repo.submit(routingConfig.id, user);

      expect(result).toEqual({
        error: {
          actualError: expect.objectContaining({
            issues: expect.arrayContaining([
              {
                expected: 'string',
                code: 'invalid_type',
                path: ['name'],
                message: 'Invalid input: expected string, received number',
              },
            ]),
          }),
          errorMeta: {
            code: 500,
            description: 'Error parsing submitted Routing Config',
          },
        },
      });
    });

    test('returns 404 failure if routing config does not exist', async () => {
      const { repo, mocks } = setup();

      const err = new ConditionalCheckFailedException({
        $metadata: {},
        message: 'msg',
      });

      mocks.dynamo.on(UpdateCommand).rejects(err);

      const result = await repo.submit(routingConfig.id, user);

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 404,
            description: 'Routing configuration not found',
          },
        },
      });
    });

    test('returns 404 failure if routing config is DELETED', async () => {
      const { repo, mocks } = setup();

      const err = new ConditionalCheckFailedException({
        Item: { status: { S: 'DELETED' satisfies RoutingConfigStatus } },
        $metadata: {},
        message: 'msg',
      });

      mocks.dynamo.on(UpdateCommand).rejects(err);

      const result = await repo.submit(routingConfig.id, user);

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 404,
            description: 'Routing configuration not found',
          },
        },
      });
    });

    test('returns 400 failure if routing config is COMPLETED', async () => {
      const { repo, mocks } = setup();

      const err = new ConditionalCheckFailedException({
        Item: { status: { S: 'COMPLETED' satisfies RoutingConfigStatus } },
        $metadata: {},
        message: 'msg',
      });

      mocks.dynamo.on(UpdateCommand).rejects(err);

      const result = await repo.submit(routingConfig.id, user);

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 400,
            description:
              'Routing configuration with status COMPLETED cannot be updated',
          },
        },
      });
    });
  });

  describe('delete', () => {
    test('updates routing config to DELETED', async () => {
      const { repo, mocks } = setup();

      const deleted: RoutingConfig = {
        ...routingConfig,
        status: 'DELETED',
      };

      mocks.dynamo.on(UpdateCommand).resolves({ Attributes: deleted });

      const result = await repo.delete(routingConfig.id, user);

      expect(result).toEqual({ data: deleted });

      expect(mocks.dynamo).toHaveReceivedCommandWith(UpdateCommand, {
        ConditionExpression: '#status = :condition_1_status',
        ExpressionAttributeNames: {
          '#status': 'status',
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy',
          '#ttl': 'ttl',
        },
        ExpressionAttributeValues: {
          ':condition_1_status': 'DRAFT',
          ':status': 'DELETED',
          ':updatedAt': date.toISOString(),
          ':updatedBy': user.userId,
          ':ttl': mockTtl,
        },
        Key: {
          id: routingConfig.id,
          owner: clientOwnerKey,
        },
        ReturnValues: 'ALL_NEW',
        TableName: TABLE_NAME,
        UpdateExpression:
          'SET #status = :status, #ttl = :ttl, #updatedAt = :updatedAt, #updatedBy = :updatedBy',
      });
    });

    test('returns failure on client error', async () => {
      const { repo, mocks } = setup();

      const err = new Error('ddb err');

      mocks.dynamo.on(UpdateCommand).rejects(err);

      const result = await repo.delete(routingConfig.id, user);

      expect(result).toEqual({
        error: {
          actualError: err,
          errorMeta: {
            code: 500,
            description: 'Failed to update routing config',
          },
        },
      });
    });

    test('returns failure if deleted template is invalid', async () => {
      const { repo, mocks } = setup();

      const completedInvalid: RoutingConfig = {
        ...routingConfig,
        status: 'COMPLETED',
        name: 0 as unknown as string,
      };

      mocks.dynamo.on(UpdateCommand).resolves({ Attributes: completedInvalid });

      const result = await repo.delete(routingConfig.id, user);

      expect(result).toEqual({
        error: {
          actualError: expect.objectContaining({
            issues: expect.arrayContaining([
              {
                expected: 'string',
                code: 'invalid_type',
                path: ['name'],
                message: 'Invalid input: expected string, received number',
              },
            ]),
          }),
          errorMeta: {
            code: 500,
            description: 'Error parsing deleted Routing Config',
          },
        },
      });
    });

    test('returns 404 failure if routing config does not exist', async () => {
      const { repo, mocks } = setup();

      const err = new ConditionalCheckFailedException({
        $metadata: {},
        message: 'msg',
      });

      mocks.dynamo.on(UpdateCommand).rejects(err);

      const result = await repo.delete(routingConfig.id, user);

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 404,
            description: 'Routing configuration not found',
          },
        },
      });
    });

    test('returns 404 failure if routing config is already DELETED', async () => {
      const { repo, mocks } = setup();

      const err = new ConditionalCheckFailedException({
        Item: { status: { S: 'DELETED' satisfies RoutingConfigStatus } },
        $metadata: {},
        message: 'msg',
      });

      mocks.dynamo.on(UpdateCommand).rejects(err);

      const result = await repo.delete(routingConfig.id, user);

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 404,
            description: 'Routing configuration not found',
          },
        },
      });
    });

    test('returns 400 failure if routing config is COMPLETED', async () => {
      const { repo, mocks } = setup();

      const err = new ConditionalCheckFailedException({
        Item: { status: { S: 'COMPLETED' satisfies RoutingConfigStatus } },
        $metadata: {},
        message: 'msg',
      });

      mocks.dynamo.on(UpdateCommand).rejects(err);

      const result = await repo.delete(routingConfig.id, user);

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 400,
            description:
              'Routing configuration with status COMPLETED cannot be updated',
          },
        },
      });
    });
  });

  describe('update', () => {
    test('updates routing config mutable fields', async () => {
      const { repo, mocks } = setup();

      const update: UpdateRoutingConfig = {
        cascade: routingConfig.cascade,
        cascadeGroupOverrides: routingConfig.cascadeGroupOverrides,
        name: routingConfig.name,
        campaignId: 'new_campaign',
      };

      const updated: RoutingConfig = {
        ...routingConfig,
        ...update,
      };

      mocks.dynamo.on(UpdateCommand).resolves({ Attributes: updated });

      const result = await repo.update(routingConfig.id, update, user);

      expect(result).toEqual({ data: updated });

      expect(mocks.dynamo).toHaveReceivedCommandWith(UpdateCommand, {
        ConditionExpression: '#status = :condition_1_status',
        ExpressionAttributeNames: {
          '#campaignId': 'campaignId',
          '#cascade': 'cascade',
          '#cascadeGroupOverrides': 'cascadeGroupOverrides',
          '#name': 'name',
          '#status': 'status',
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy',
        },
        ExpressionAttributeValues: {
          ':campaignId': update.campaignId,
          ':cascade': update.cascade,
          ':cascadeGroupOverrides': update.cascadeGroupOverrides,
          ':condition_1_status': 'DRAFT',
          ':name': update.name,
          ':updatedAt': date.toISOString(),
          ':updatedBy': user.userId,
        },
        Key: {
          id: routingConfig.id,
          owner: clientOwnerKey,
        },
        ReturnValues: 'ALL_NEW',
        TableName: TABLE_NAME,
        UpdateExpression:
          'SET #name = :name, #campaignId = :campaignId, #cascade = :cascade, #cascadeGroupOverrides = :cascadeGroupOverrides, #updatedAt = :updatedAt, #updatedBy = :updatedBy',
      });
    });

    test('partial update - name only', async () => {
      const { repo, mocks } = setup();

      const update: UpdateRoutingConfig = {
        name: 'new_name',
      };

      const updated: RoutingConfig = {
        ...routingConfig,
        ...update,
      };

      mocks.dynamo.on(UpdateCommand).resolves({ Attributes: updated });

      const result = await repo.update(routingConfig.id, update, user);

      expect(result).toEqual({ data: updated });

      expect(mocks.dynamo).toHaveReceivedCommandWith(UpdateCommand, {
        ConditionExpression: '#status = :condition_1_status',
        ExpressionAttributeNames: {
          '#name': 'name',
          '#status': 'status',
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy',
        },
        ExpressionAttributeValues: {
          ':condition_1_status': 'DRAFT',
          ':name': update.name,
          ':updatedAt': date.toISOString(),
          ':updatedBy': user.userId,
        },
        Key: {
          id: routingConfig.id,
          owner: clientOwnerKey,
        },
        ReturnValues: 'ALL_NEW',
        TableName: TABLE_NAME,
        UpdateExpression:
          'SET #name = :name, #updatedAt = :updatedAt, #updatedBy = :updatedBy',
      });
    });

    test('partial update - campaignId only', async () => {
      const { repo, mocks } = setup();

      const update: UpdateRoutingConfig = {
        campaignId: 'new_campaign',
      };

      const updated: RoutingConfig = {
        ...routingConfig,
        ...update,
      };

      mocks.dynamo.on(UpdateCommand).resolves({ Attributes: updated });

      const result = await repo.update(routingConfig.id, update, user);

      expect(result).toEqual({ data: updated });

      expect(mocks.dynamo).toHaveReceivedCommandWith(UpdateCommand, {
        ConditionExpression: '#status = :condition_1_status',
        ExpressionAttributeNames: {
          '#campaignId': 'campaignId',
          '#status': 'status',
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy',
        },
        ExpressionAttributeValues: {
          ':condition_1_status': 'DRAFT',
          ':campaignId': update.campaignId,
          ':updatedAt': date.toISOString(),
          ':updatedBy': user.userId,
        },
        Key: {
          id: routingConfig.id,
          owner: clientOwnerKey,
        },
        ReturnValues: 'ALL_NEW',
        TableName: TABLE_NAME,
        UpdateExpression:
          'SET #campaignId = :campaignId, #updatedAt = :updatedAt, #updatedBy = :updatedBy',
      });
    });

    test('partial update - cascade/cascadeGroupOverrides', async () => {
      const { repo, mocks } = setup();

      const update: UpdateRoutingConfig = {
        cascade: [
          {
            cascadeGroups: ['standard'],
            channel: 'SMS',
            channelType: 'primary',
            defaultTemplateId: 'c003b4f1-d788-423d-a948-0df511d07a23',
          },
        ],
        cascadeGroupOverrides: [{ name: 'standard' }],
      };

      const updated: RoutingConfig = {
        ...routingConfig,
        ...update,
      };

      mocks.dynamo.on(UpdateCommand).resolves({ Attributes: updated });

      const result = await repo.update(routingConfig.id, update, user);

      expect(result).toEqual({ data: updated });

      expect(mocks.dynamo).toHaveReceivedCommandWith(UpdateCommand, {
        ConditionExpression: '#status = :condition_1_status',
        ExpressionAttributeNames: {
          '#cascade': 'cascade',
          '#cascadeGroupOverrides': 'cascadeGroupOverrides',
          '#status': 'status',
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy',
        },
        ExpressionAttributeValues: {
          ':condition_1_status': 'DRAFT',
          ':cascade': update.cascade,
          ':cascadeGroupOverrides': update.cascadeGroupOverrides,
          ':updatedAt': date.toISOString(),
          ':updatedBy': user.userId,
        },
        Key: {
          id: routingConfig.id,
          owner: clientOwnerKey,
        },
        ReturnValues: 'ALL_NEW',
        TableName: TABLE_NAME,
        UpdateExpression:
          'SET #cascade = :cascade, #cascadeGroupOverrides = :cascadeGroupOverrides, #updatedAt = :updatedAt, #updatedBy = :updatedBy',
      });
    });

    test('partial update - does not set cascade without cascadeGroupOverrides', async () => {
      const { repo, mocks } = setup();

      const update: UpdateRoutingConfig = {
        cascade: [
          {
            cascadeGroups: ['standard'],
            channel: 'SMS',
            channelType: 'primary',
            defaultTemplateId: 'c003b4f1-d788-423d-a948-0df511d07a23',
          },
        ],
        name: 'new_name',
      };

      const updated: RoutingConfig = {
        ...routingConfig,
        name: 'new_name',
      };

      mocks.dynamo.on(UpdateCommand).resolves({ Attributes: updated });

      const result = await repo.update(routingConfig.id, update, user);

      expect(result).toEqual({ data: updated });

      expect(mocks.dynamo).toHaveReceivedCommandWith(UpdateCommand, {
        ConditionExpression: '#status = :condition_1_status',
        ExpressionAttributeNames: {
          '#name': 'name',
          '#status': 'status',
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy',
        },
        ExpressionAttributeValues: {
          ':condition_1_status': 'DRAFT',
          ':name': update.name,
          ':updatedAt': date.toISOString(),
          ':updatedBy': user.userId,
        },
        Key: {
          id: routingConfig.id,
          owner: clientOwnerKey,
        },
        ReturnValues: 'ALL_NEW',
        TableName: TABLE_NAME,
        UpdateExpression:
          'SET #name = :name, #updatedAt = :updatedAt, #updatedBy = :updatedBy',
      });
    });

    test('partial update - does not set cascadeGroupOverrides without cascade', async () => {
      const { repo, mocks } = setup();

      const update: UpdateRoutingConfig = {
        cascadeGroupOverrides: [{ name: 'translations', language: ['ar'] }],
        name: 'new_name',
      };

      const updated: RoutingConfig = {
        ...routingConfig,
        name: 'new_name',
      };

      mocks.dynamo.on(UpdateCommand).resolves({ Attributes: updated });

      const result = await repo.update(routingConfig.id, update, user);

      expect(result).toEqual({ data: updated });

      expect(mocks.dynamo).toHaveReceivedCommandWith(UpdateCommand, {
        ConditionExpression: '#status = :condition_1_status',
        ExpressionAttributeNames: {
          '#name': 'name',
          '#status': 'status',
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy',
        },
        ExpressionAttributeValues: {
          ':condition_1_status': 'DRAFT',
          ':name': update.name,
          ':updatedAt': date.toISOString(),
          ':updatedBy': user.userId,
        },
        Key: {
          id: routingConfig.id,
          owner: clientOwnerKey,
        },
        ReturnValues: 'ALL_NEW',
        TableName: TABLE_NAME,
        UpdateExpression:
          'SET #name = :name, #updatedAt = :updatedAt, #updatedBy = :updatedBy',
      });
    });

    test('does not update status', async () => {
      const { repo, mocks } = setup();

      const update = {
        cascade: routingConfig.cascade,
        cascadeGroupOverrides: routingConfig.cascadeGroupOverrides,
        name: routingConfig.name,
        campaignId: routingConfig.campaignId,
        status: 'DELETED',
      } as UpdateRoutingConfig;

      mocks.dynamo.on(UpdateCommand).resolves({ Attributes: routingConfig });

      const result = await repo.update(routingConfig.id, update, user);

      expect(result).toEqual({ data: routingConfig });

      expect(mocks.dynamo).toHaveReceivedCommandWith(UpdateCommand, {
        ConditionExpression: '#status = :condition_1_status',
        ExpressionAttributeNames: {
          '#campaignId': 'campaignId',
          '#cascade': 'cascade',
          '#cascadeGroupOverrides': 'cascadeGroupOverrides',
          '#name': 'name',
          '#status': 'status',
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy',
        },
        ExpressionAttributeValues: {
          ':campaignId': update.campaignId,
          ':cascade': update.cascade,
          ':cascadeGroupOverrides': update.cascadeGroupOverrides,
          ':condition_1_status': 'DRAFT',
          ':name': update.name,
          ':updatedAt': date.toISOString(),
          ':updatedBy': user.userId,
        },
        Key: {
          id: routingConfig.id,
          owner: clientOwnerKey,
        },
        ReturnValues: 'ALL_NEW',
        TableName: TABLE_NAME,
        UpdateExpression:
          'SET #name = :name, #campaignId = :campaignId, #cascade = :cascade, #cascadeGroupOverrides = :cascadeGroupOverrides, #updatedAt = :updatedAt, #updatedBy = :updatedBy',
      });
    });

    test('returns failure on client error', async () => {
      const { repo, mocks } = setup();

      const err = new Error('ddb err');

      mocks.dynamo.on(UpdateCommand).rejects(err);

      const result = await repo.update(
        routingConfig.id,
        {
          cascade: routingConfig.cascade,
          cascadeGroupOverrides: routingConfig.cascadeGroupOverrides,
          name: routingConfig.name,
          campaignId: routingConfig.campaignId,
        },
        user
      );

      expect(result).toEqual({
        error: {
          actualError: err,
          errorMeta: {
            code: 500,
            description: 'Failed to update routing config',
          },
        },
      });
    });

    test('returns failure if updated template is invalid', async () => {
      const { repo, mocks } = setup();

      const updatedInvalid: RoutingConfig = {
        ...routingConfig,
        status: 'NOT_A_STATUS' as RoutingConfigStatus,
      };

      mocks.dynamo.on(UpdateCommand).resolves({ Attributes: updatedInvalid });

      const result = await repo.update(
        routingConfig.id,
        {
          cascade: routingConfig.cascade,
          cascadeGroupOverrides: routingConfig.cascadeGroupOverrides,
          name: routingConfig.name,
          campaignId: routingConfig.campaignId,
        },
        user
      );

      expect(result).toEqual({
        error: {
          actualError: expect.objectContaining({
            issues: expect.arrayContaining([
              {
                code: 'invalid_value',
                values: ['COMPLETED', 'DELETED', 'DRAFT'],
                path: ['status'],
                message:
                  'Invalid option: expected one of "COMPLETED"|"DELETED"|"DRAFT"',
              },
            ]),
          }),
          errorMeta: {
            code: 500,
            description: 'Error parsing updated Routing Config',
          },
        },
      });
    });

    test('returns 404 failure if routing config does not exist', async () => {
      const { repo, mocks } = setup();

      const err = new ConditionalCheckFailedException({
        $metadata: {},
        message: 'msg',
      });

      mocks.dynamo.on(UpdateCommand).rejects(err);

      const result = await repo.submit(routingConfig.id, user);

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 404,
            description: 'Routing configuration not found',
          },
        },
      });
    });

    test('returns 404 failure if routing config is DELETED', async () => {
      const { repo, mocks } = setup();

      const err = new ConditionalCheckFailedException({
        Item: { status: { S: 'DELETED' satisfies RoutingConfigStatus } },
        $metadata: {},
        message: 'msg',
      });

      mocks.dynamo.on(UpdateCommand).rejects(err);

      const result = await repo.submit(routingConfig.id, user);

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 404,
            description: 'Routing configuration not found',
          },
        },
      });
    });

    test('returns 400 failure if routing config is COMPLETED', async () => {
      const { repo, mocks } = setup();

      const err = new ConditionalCheckFailedException({
        Item: { status: { S: 'COMPLETED' satisfies RoutingConfigStatus } },
        $metadata: {},
        message: 'msg',
      });

      mocks.dynamo.on(UpdateCommand).rejects(err);

      const result = await repo.submit(routingConfig.id, user);

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 400,
            description:
              'Routing configuration with status COMPLETED cannot be updated',
          },
        },
      });
    });
  });
});
