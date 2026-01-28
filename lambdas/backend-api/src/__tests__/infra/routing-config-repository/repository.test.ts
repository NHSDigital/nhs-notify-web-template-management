import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  TransactWriteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import { ZodError } from 'zod';
import { RoutingConfigRepository } from '../../../infra/routing-config-repository';
import {
  routingConfig,
  makeRoutingConfig,
} from '../../fixtures/routing-config';
import {
  CreateRoutingConfig,
  RoutingConfig,
  RoutingConfigStatus,
  UpdateRoutingConfig,
} from 'nhs-notify-backend-client';
import { randomUUID, UUID } from 'node:crypto';
import {
  ConditionalCheckFailedException,
  TransactionCanceledException,
  ReturnValuesOnConditionCheckFailure,
} from '@aws-sdk/client-dynamodb';

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
const TEMPLATE_TABLE_NAME = 'template-table-name';
const user = { internalUserId: 'user', clientId: 'nhs-notify-client-id' };
const clientOwnerKey = `CLIENT#${user.clientId}`;

const dynamo = mockClient(DynamoDBDocumentClient);

function setup() {
  dynamo.reset();

  const mocks = { dynamo };

  const repo = new RoutingConfigRepository(
    // pass an actual doc client - it gets intercepted by mockClient,
    // but paginateQuery needs the real deal
    DynamoDBDocumentClient.from(new DynamoDBClient({})),
    TABLE_NAME,
    TEMPLATE_TABLE_NAME
  );

  return { repo, mocks };
}

describe('RoutingConfigRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
          errorMeta: {
            code: 404,
            description: 'Routing configuration not found',
          },
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
      cascadeGroupOverrides: [],
    };

    const rc: RoutingConfig = {
      ...input,
      clientId: user.clientId,
      createdAt: date.toISOString(),
      defaultCascadeGroup: 'standard',
      id: generatedId,
      status: 'DRAFT',
      updatedAt: date.toISOString(),
      lockNumber: 0,
    };

    const putPayload = {
      ...rc,
      owner: clientOwnerKey,
      createdBy: `INTERNAL_USER#${user.internalUserId}`,
      updatedBy: `INTERNAL_USER#${user.internalUserId}`,
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

      const routingConfigWithLock: RoutingConfig = {
        ...routingConfig,
        lockNumber: 2,
      };

      const completed: RoutingConfig = {
        ...routingConfig,
        status: 'COMPLETED',
        lockNumber: 3,
      };

      mocks.dynamo
        .on(GetCommand)
        .resolvesOnce({ Item: routingConfigWithLock })
        .resolvesOnce({ Item: completed });
      mocks.dynamo.on(TransactWriteCommand).resolvesOnce({});

      const result = await repo.submit(routingConfig.id, user, 2);

      expect(result).toEqual({ data: completed });

      expect(mocks.dynamo).toHaveReceivedCommandWith(TransactWriteCommand, {
        TransactItems: [
          {
            Update: {
              ConditionExpression:
                '#status = :condition_1_status AND #lockNumber = :condition_2_lockNumber',
              ExpressionAttributeNames: {
                '#lockNumber': 'lockNumber',
                '#status': 'status',
                '#updatedAt': 'updatedAt',
                '#updatedBy': 'updatedBy',
              },
              ExpressionAttributeValues: {
                ':condition_1_status': 'DRAFT',
                ':condition_2_lockNumber': 2,
                ':lockNumber': 1,
                ':status': 'COMPLETED',
                ':updatedAt': date.toISOString(),
                ':updatedBy': `INTERNAL_USER#${user.internalUserId}`,
              },
              Key: {
                id: routingConfig.id,
                owner: clientOwnerKey,
              },
              ReturnValues: 'ALL_NEW',
              ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
              TableName: 'routing-config-table-name',
              UpdateExpression:
                'SET #status = :status, #updatedAt = :updatedAt, #updatedBy = :updatedBy ADD #lockNumber :lockNumber',
            },
          },
          {
            ConditionCheck: {
              ConditionExpression:
                'attribute_exists(id) AND templateStatus <> :deleted AND (templateType <> :letterType OR templateStatus IN (:proofApproved, :submitted))',
              ExpressionAttributeValues: {
                ':deleted': 'DELETED',
                ':letterType': 'LETTER',
                ':proofApproved': 'PROOF_APPROVED',
                ':submitted': 'SUBMITTED',
              },
              Key: {
                id: routingConfig.cascade[0].defaultTemplateId!,
                owner: clientOwnerKey,
              },
              ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
              TableName: 'template-table-name',
            },
          },
        ],
      });
    });

    test('returns failure on client error during initial get', async () => {
      const { repo, mocks } = setup();

      const err = new Error('ddb err');

      mocks.dynamo.on(GetCommand).rejectsOnce(err);

      const result = await repo.submit(routingConfig.id, user, 2);

      expect(result).toEqual({
        error: {
          actualError: err,
          errorMeta: {
            code: 500,
            description: 'Error retrieving Routing Config',
          },
        },
      });
    });

    test('returns failure on client error during transaction', async () => {
      const { repo, mocks } = setup();

      const err = new Error('ddb err');

      const routingConfigWithLock: RoutingConfig = {
        ...routingConfig,
        lockNumber: 2,
      };

      mocks.dynamo.on(GetCommand).resolvesOnce({ Item: routingConfigWithLock });
      mocks.dynamo.on(TransactWriteCommand).rejectsOnce(err);

      const result = await repo.submit(routingConfig.id, user, 2);

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

      const routingConfigWithLock: RoutingConfig = {
        ...routingConfig,
        lockNumber: 2,
      };

      const completedInvalid: RoutingConfig = {
        ...routingConfig,
        status: 'COMPLETED',
        name: 0 as unknown as string,
      };

      mocks.dynamo
        .on(GetCommand)
        .resolvesOnce({ Item: routingConfigWithLock })
        .resolvesOnce({ Item: completedInvalid });
      mocks.dynamo.on(TransactWriteCommand).resolvesOnce({});

      const result = await repo.submit(routingConfig.id, user, 2);

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

      mocks.dynamo.on(GetCommand).resolvesOnce({ Item: undefined });

      const result = await repo.submit(routingConfig.id, user, 2);

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 404,
            description: 'Routing configuration not found',
          },
        },
      });
    });

    test('returns 404 failure if transaction fails because routing config does not exist', async () => {
      const { repo, mocks } = setup();

      const routingConfigWithLock: RoutingConfig = {
        ...routingConfig,
        lockNumber: 2,
      };

      const err = new TransactionCanceledException({
        $metadata: {},
        message: 'msg',
        CancellationReasons: [{ Code: 'ConditionalCheckFailed' }],
      });

      mocks.dynamo.on(GetCommand).resolvesOnce({ Item: routingConfigWithLock });
      mocks.dynamo.on(TransactWriteCommand).rejectsOnce(err);

      const result = await repo.submit(routingConfig.id, user, 2);

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

      const deletedRoutingConfig: RoutingConfig = {
        ...routingConfig,
        status: 'DELETED',
      };

      mocks.dynamo.on(GetCommand).resolvesOnce({ Item: deletedRoutingConfig });

      const result = await repo.submit(routingConfig.id, user, 2);

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 404,
            description: 'Routing configuration not found',
          },
        },
      });

      expect(mocks.dynamo).not.toHaveReceivedCommand(TransactWriteCommand);
    });

    test('returns 400 failure if routing config is COMPLETED', async () => {
      const { repo, mocks } = setup();

      const completedRoutingConfig: RoutingConfig = {
        ...routingConfig,
        status: 'COMPLETED',
      };

      mocks.dynamo
        .on(GetCommand)
        .resolvesOnce({ Item: completedRoutingConfig });

      const result = await repo.submit(routingConfig.id, user, 2);

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 400,
            description:
              'Routing configuration with status COMPLETED cannot be updated',
          },
        },
      });

      expect(mocks.dynamo).not.toHaveReceivedCommand(TransactWriteCommand);
    });

    test("returns 409 failure if lock number doesn't match", async () => {
      const { repo, mocks } = setup();

      const mismatchedLockRoutingConfig: RoutingConfig = {
        ...routingConfig,
        lockNumber: 3,
      };

      mocks.dynamo
        .on(GetCommand)
        .resolvesOnce({ Item: mismatchedLockRoutingConfig });

      const result = await repo.submit(routingConfig.id, user, 2);

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 409,
            description:
              'Lock number mismatch - Message Plan has been modified since last read',
          },
        },
      });

      expect(mocks.dynamo).not.toHaveReceivedCommand(TransactWriteCommand);
    });

    test('returns validation failure if cascade item has no defaultTemplateId or conditionalTemplates', async () => {
      const { repo, mocks } = setup();

      const invalidRoutingConfig: RoutingConfig = {
        ...routingConfig,
        lockNumber: 2,
        cascade: [
          {
            cascadeGroups: ['standard'],
            channel: 'NHSAPP',
            channelType: 'primary',
            conditionalTemplates: [],
          },
        ],
      };

      mocks.dynamo.on(GetCommand).resolvesOnce({ Item: invalidRoutingConfig });

      const result = await repo.submit(routingConfig.id, user, 2);

      expect(result).toEqual({
        error: {
          actualError: expect.any(Error),
          errorMeta: {
            code: 400,
            description:
              'Routing config is not ready for submission: all cascade items must have templates assigned',
          },
        },
      });

      expect(mocks.dynamo).not.toHaveReceivedCommand(TransactWriteCommand);
    });

    test('returns validation failure if defaultTemplateId is null with no conditionalTemplates', async () => {
      const { repo, mocks } = setup();

      const invalidRoutingConfig: RoutingConfig = {
        ...routingConfig,
        lockNumber: 2,
        cascade: [
          {
            cascadeGroups: ['standard'],
            channel: 'NHSAPP',
            channelType: 'primary',
            defaultTemplateId: null,
          },
        ],
      };

      mocks.dynamo.on(GetCommand).resolvesOnce({ Item: invalidRoutingConfig });

      const result = await repo.submit(routingConfig.id, user, 2);

      expect(result).toEqual({
        error: {
          actualError: expect.any(Error),
          errorMeta: {
            code: 400,
            description:
              'Routing config is not ready for submission: all cascade items must have templates assigned',
          },
        },
      });

      expect(mocks.dynamo).not.toHaveReceivedCommand(TransactWriteCommand);
    });

    test('returns 400 failure if template not found during submit', async () => {
      const { repo, mocks } = setup();

      const routingConfigWithTemplate: RoutingConfig = {
        ...routingConfig,
        lockNumber: 2,
        cascade: [
          {
            cascadeGroups: ['standard'],
            channel: 'SMS',
            channelType: 'primary',
            defaultTemplateId: 'missing-template-id',
          },
        ],
      };

      const err = new TransactionCanceledException({
        $metadata: {},
        message: 'msg',
        CancellationReasons: [
          { Code: 'None' }, // Update succeeded
          { Code: 'ConditionalCheckFailed', Item: undefined }, // Template not found (no Item returned)
        ],
      });

      mocks.dynamo
        .on(GetCommand)
        .resolvesOnce({ Item: routingConfigWithTemplate });
      mocks.dynamo.on(TransactWriteCommand).rejectsOnce(err);

      const result = await repo.submit(routingConfig.id, user, 2);

      expect(result).toEqual({
        error: {
          actualError: err,
          errorMeta: {
            code: 400,
            description: 'Some templates not found',
            details: { templateIds: 'missing-template-id' },
          },
        },
      });
    });

    test('returns 400 failure if template has DELETED status', async () => {
      const { repo, mocks } = setup();

      const routingConfigWithTemplate: RoutingConfig = {
        ...routingConfig,
        lockNumber: 2,
        cascade: [
          {
            cascadeGroups: ['standard'],
            channel: 'SMS',
            channelType: 'primary',
            defaultTemplateId: 'deleted-template-id',
          },
        ],
      };

      const err = new TransactionCanceledException({
        $metadata: {},
        message: 'msg',
        CancellationReasons: [
          { Code: 'None' }, // Update succeeded
          {
            Code: 'ConditionalCheckFailed',
            Item: {
              id: { S: 'deleted-template-id' },
              templateType: { S: 'SMS' },
              templateStatus: { S: 'DELETED' },
            },
          },
        ],
      });

      mocks.dynamo
        .on(GetCommand)
        .resolvesOnce({ Item: routingConfigWithTemplate });
      mocks.dynamo.on(TransactWriteCommand).rejectsOnce(err);

      const result = await repo.submit(routingConfig.id, user, 2);

      expect(result).toEqual({
        error: {
          actualError: err,
          errorMeta: {
            code: 400,
            description: 'Some templates not found',
            details: { templateIds: 'deleted-template-id' },
          },
        },
      });
    });

    test('returns 400 failure if LETTER template has invalid status', async () => {
      const { repo, mocks } = setup();

      const routingConfigWithLetter: RoutingConfig = {
        ...routingConfig,
        lockNumber: 2,
        cascade: [
          {
            cascadeGroups: ['standard'],
            channel: 'LETTER',
            channelType: 'primary',
            defaultTemplateId: 'letter-template-id',
          },
        ],
      };

      const err = new TransactionCanceledException({
        $metadata: {},
        message: 'msg',
        CancellationReasons: [
          { Code: 'None' },
          {
            Code: 'ConditionalCheckFailed',
            Item: {
              id: { S: 'letter-template-id' },
              templateType: { S: 'LETTER' },
              templateStatus: { S: 'DRAFT' },
            },
          },
        ],
      });

      mocks.dynamo
        .on(GetCommand)
        .resolvesOnce({ Item: routingConfigWithLetter });
      mocks.dynamo.on(TransactWriteCommand).rejectsOnce(err);

      const result = await repo.submit(routingConfig.id, user, 2);

      expect(result).toEqual({
        error: {
          actualError: err,
          errorMeta: {
            code: 400,
            description:
              'Letter templates must have status PROOF_APPROVED or SUBMITTED',
            details: { templateIds: 'letter-template-id' },
          },
        },
      });

      expect(mocks.dynamo).toHaveReceivedCommandWith(TransactWriteCommand, {
        TransactItems: expect.arrayContaining([
          {
            ConditionCheck: {
              TableName: TEMPLATE_TABLE_NAME,
              Key: {
                id: 'letter-template-id',
                owner: clientOwnerKey,
              },
              ConditionExpression:
                'attribute_exists(id) AND templateStatus <> :deleted AND (templateType <> :letterType OR templateStatus IN (:proofApproved, :submitted))',
              ExpressionAttributeValues: {
                ':deleted': 'DELETED',
                ':letterType': 'LETTER',
                ':proofApproved': 'PROOF_APPROVED',
                ':submitted': 'SUBMITTED',
              },
              ReturnValuesOnConditionCheckFailure:
                ReturnValuesOnConditionCheckFailure.ALL_OLD,
            },
          },
        ]),
      });
    });

    test('returns 500 failure on unexpected TransactionCanceledException', async () => {
      const { repo, mocks } = setup();

      // Transaction cancelled with update succeeded but no template failures
      // This is an edge case that shouldn't normally happen
      const err = new TransactionCanceledException({
        $metadata: {},
        message: 'Unexpected cancellation',
        CancellationReasons: [
          { Code: 'None' }, // Update succeeded
          { Code: 'None' }, // Template check also passed (unexpected)
        ],
      });

      const routingConfigWithTemplate: RoutingConfig = {
        ...routingConfig,
        lockNumber: 2,
        cascade: [
          {
            cascadeGroups: ['standard'],
            channel: 'SMS',
            channelType: 'primary',
            defaultTemplateId: 'some-template-id',
          },
        ],
      };

      mocks.dynamo
        .on(GetCommand)
        .resolvesOnce({ Item: routingConfigWithTemplate });
      mocks.dynamo.on(TransactWriteCommand).rejectsOnce(err);

      const result = await repo.submit(routingConfig.id, user, 2);

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

    test('returns 500 failure on TransactionCanceledException with undefined CancellationReasons', async () => {
      const { repo, mocks } = setup();

      const err = new TransactionCanceledException({
        $metadata: {},
        message: 'Transaction cancelled with no reasons',
        CancellationReasons: undefined,
      });

      const routingConfigWithLock: RoutingConfig = {
        ...routingConfig,
        lockNumber: 2,
      };

      mocks.dynamo.on(GetCommand).resolvesOnce({ Item: routingConfigWithLock });
      mocks.dynamo.on(TransactWriteCommand).rejectsOnce(err);

      const result = await repo.submit(routingConfig.id, user, 2);

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
  });

  describe('delete', () => {
    test('updates routing config to DELETED', async () => {
      const { repo, mocks } = setup();

      const deleted: RoutingConfig = {
        ...routingConfig,
        status: 'DELETED',
      };

      mocks.dynamo.on(UpdateCommand).resolves({ Attributes: deleted });

      const result = await repo.delete(routingConfig.id, user, 2);

      expect(result).toEqual({ data: deleted });

      expect(mocks.dynamo).toHaveReceivedCommandWith(UpdateCommand, {
        ConditionExpression:
          '#status = :condition_1_status AND #lockNumber = :condition_2_lockNumber',
        ExpressionAttributeNames: {
          '#lockNumber': 'lockNumber',
          '#status': 'status',
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy',
          '#ttl': 'ttl',
        },
        ExpressionAttributeValues: {
          ':condition_1_status': 'DRAFT',
          ':condition_2_lockNumber': 2,
          ':lockNumber': 1,
          ':status': 'DELETED',
          ':updatedAt': date.toISOString(),
          ':updatedBy': `INTERNAL_USER#${user.internalUserId}`,
          ':ttl': mockTtl,
        },
        Key: {
          id: routingConfig.id,
          owner: clientOwnerKey,
        },
        ReturnValues: 'ALL_NEW',
        TableName: TABLE_NAME,
        UpdateExpression:
          'SET #status = :status, #ttl = :ttl, #updatedAt = :updatedAt, #updatedBy = :updatedBy ADD #lockNumber :lockNumber',
      });
    });

    test('returns failure on client error', async () => {
      const { repo, mocks } = setup();

      const err = new Error('ddb err');

      mocks.dynamo.on(UpdateCommand).rejects(err);

      const result = await repo.delete(routingConfig.id, user, 2);

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

      const result = await repo.delete(routingConfig.id, user, 2);

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

      const result = await repo.delete(routingConfig.id, user, 2);

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

      const result = await repo.delete(routingConfig.id, user, 2);

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

      const result = await repo.delete(routingConfig.id, user, 2);

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

    test("returns 409 failure if routing config lock number doesn't match", async () => {
      const { repo, mocks } = setup();

      const err = new ConditionalCheckFailedException({
        Item: {
          status: { S: 'DRAFT' satisfies RoutingConfigStatus },
          lockNumber: { N: '3' },
        },
        $metadata: {},
        message: 'msg',
      });

      mocks.dynamo.on(UpdateCommand).rejects(err);

      const result = await repo.delete(routingConfig.id, user, 2);

      expect(result).toEqual({
        error: {
          actualError: err,
          errorMeta: {
            code: 409,
            description:
              'Lock number mismatch - Message Plan has been modified since last read',
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

      mocks.dynamo.on(TransactWriteCommand).resolves({});
      mocks.dynamo.on(GetCommand).resolves({ Item: updated });

      const result = await repo.update(routingConfig.id, update, user, 2);

      expect(result).toEqual({ data: updated });

      expect(mocks.dynamo).toHaveReceivedCommandWith(TransactWriteCommand, {
        TransactItems: [
          {
            Update: {
              ConditionExpression:
                '#status = :condition_1_status AND #lockNumber = :condition_2_lockNumber',
              ExpressionAttributeNames: {
                '#campaignId': 'campaignId',
                '#cascade': 'cascade',
                '#cascadeGroupOverrides': 'cascadeGroupOverrides',
                '#lockNumber': 'lockNumber',
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
                ':condition_2_lockNumber': 2,
                ':lockNumber': 1,
                ':name': update.name,
                ':updatedAt': date.toISOString(),
                ':updatedBy': `INTERNAL_USER#${user.internalUserId}`,
              },
              Key: {
                id: routingConfig.id,
                owner: clientOwnerKey,
              },
              ReturnValues: 'ALL_NEW',
              ReturnValuesOnConditionCheckFailure:
                ReturnValuesOnConditionCheckFailure.ALL_OLD,
              TableName: TABLE_NAME,
              UpdateExpression:
                'SET #name = :name, #campaignId = :campaignId, #cascade = :cascade, #cascadeGroupOverrides = :cascadeGroupOverrides, #updatedAt = :updatedAt, #updatedBy = :updatedBy ADD #lockNumber :lockNumber',
            },
          },
          {
            ConditionCheck: {
              TableName: TEMPLATE_TABLE_NAME,
              Key: {
                id: '90e46ece-4a3b-47bd-b781-f986b42a5a09',
                owner: clientOwnerKey,
              },
              ConditionExpression: 'attribute_exists(id)',
            },
          },
        ],
      });

      expect(mocks.dynamo).toHaveReceivedCommandWith(GetCommand, {
        TableName: TABLE_NAME,
        Key: {
          id: routingConfig.id,
          owner: clientOwnerKey,
        },
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

      mocks.dynamo.on(TransactWriteCommand).resolves({});
      mocks.dynamo.on(GetCommand).resolves({ Item: updated });

      const result = await repo.update(routingConfig.id, update, user, 2);

      expect(result).toEqual({ data: updated });

      expect(mocks.dynamo).toHaveReceivedCommandWith(TransactWriteCommand, {
        TransactItems: [
          {
            Update: {
              ConditionExpression:
                '#status = :condition_1_status AND #lockNumber = :condition_2_lockNumber',
              ExpressionAttributeNames: {
                '#lockNumber': 'lockNumber',
                '#name': 'name',
                '#status': 'status',
                '#updatedAt': 'updatedAt',
                '#updatedBy': 'updatedBy',
              },
              ExpressionAttributeValues: {
                ':condition_1_status': 'DRAFT',
                ':condition_2_lockNumber': 2,
                ':lockNumber': 1,
                ':name': update.name,
                ':updatedAt': date.toISOString(),
                ':updatedBy': `INTERNAL_USER#${user.internalUserId}`,
              },
              Key: {
                id: routingConfig.id,
                owner: clientOwnerKey,
              },
              ReturnValues: 'ALL_NEW',
              ReturnValuesOnConditionCheckFailure:
                ReturnValuesOnConditionCheckFailure.ALL_OLD,
              TableName: TABLE_NAME,
              UpdateExpression:
                'SET #name = :name, #updatedAt = :updatedAt, #updatedBy = :updatedBy ADD #lockNumber :lockNumber',
            },
          },
        ],
      });

      expect(mocks.dynamo).toHaveReceivedCommandWith(GetCommand, {
        TableName: TABLE_NAME,
        Key: {
          id: routingConfig.id,
          owner: clientOwnerKey,
        },
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

      mocks.dynamo.on(TransactWriteCommand).resolves({});
      mocks.dynamo.on(GetCommand).resolves({ Item: updated });

      const result = await repo.update(routingConfig.id, update, user, 2);

      expect(result).toEqual({ data: updated });

      expect(mocks.dynamo).toHaveReceivedCommandWith(TransactWriteCommand, {
        TransactItems: [
          {
            Update: {
              ConditionExpression:
                '#status = :condition_1_status AND #lockNumber = :condition_2_lockNumber',
              ExpressionAttributeNames: {
                '#lockNumber': 'lockNumber',
                '#campaignId': 'campaignId',
                '#status': 'status',
                '#updatedAt': 'updatedAt',
                '#updatedBy': 'updatedBy',
              },
              ExpressionAttributeValues: {
                ':condition_1_status': 'DRAFT',
                ':condition_2_lockNumber': 2,
                ':lockNumber': 1,
                ':campaignId': update.campaignId,
                ':updatedAt': date.toISOString(),
                ':updatedBy': `INTERNAL_USER#${user.internalUserId}`,
              },
              Key: {
                id: routingConfig.id,
                owner: clientOwnerKey,
              },
              ReturnValues: 'ALL_NEW',
              ReturnValuesOnConditionCheckFailure:
                ReturnValuesOnConditionCheckFailure.ALL_OLD,
              TableName: TABLE_NAME,
              UpdateExpression:
                'SET #campaignId = :campaignId, #updatedAt = :updatedAt, #updatedBy = :updatedBy ADD #lockNumber :lockNumber',
            },
          },
        ],
      });

      expect(mocks.dynamo).toHaveReceivedCommandWith(GetCommand, {
        TableName: TABLE_NAME,
        Key: {
          id: routingConfig.id,
          owner: clientOwnerKey,
        },
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

      mocks.dynamo.on(TransactWriteCommand).resolves({});
      mocks.dynamo.on(GetCommand).resolves({ Item: updated });

      const result = await repo.update(routingConfig.id, update, user, 2);

      expect(result).toEqual({ data: updated });

      expect(mocks.dynamo).toHaveReceivedCommandWith(TransactWriteCommand, {
        TransactItems: [
          {
            Update: {
              ConditionExpression:
                '#status = :condition_1_status AND #lockNumber = :condition_2_lockNumber',
              ExpressionAttributeNames: {
                '#cascade': 'cascade',
                '#cascadeGroupOverrides': 'cascadeGroupOverrides',
                '#lockNumber': 'lockNumber',
                '#status': 'status',
                '#updatedAt': 'updatedAt',
                '#updatedBy': 'updatedBy',
              },
              ExpressionAttributeValues: {
                ':condition_1_status': 'DRAFT',
                ':condition_2_lockNumber': 2,
                ':lockNumber': 1,
                ':cascade': update.cascade,
                ':cascadeGroupOverrides': update.cascadeGroupOverrides,
                ':updatedAt': date.toISOString(),
                ':updatedBy': `INTERNAL_USER#${user.internalUserId}`,
              },
              Key: {
                id: routingConfig.id,
                owner: clientOwnerKey,
              },
              ReturnValues: 'ALL_NEW',
              ReturnValuesOnConditionCheckFailure:
                ReturnValuesOnConditionCheckFailure.ALL_OLD,
              TableName: TABLE_NAME,
              UpdateExpression:
                'SET #cascade = :cascade, #cascadeGroupOverrides = :cascadeGroupOverrides, #updatedAt = :updatedAt, #updatedBy = :updatedBy ADD #lockNumber :lockNumber',
            },
          },
          {
            ConditionCheck: {
              TableName: TEMPLATE_TABLE_NAME,
              Key: {
                id: 'c003b4f1-d788-423d-a948-0df511d07a23',
                owner: clientOwnerKey,
              },
              ConditionExpression: 'attribute_exists(id)',
            },
          },
        ],
      });

      expect(mocks.dynamo).toHaveReceivedCommandWith(GetCommand, {
        TableName: TABLE_NAME,
        Key: {
          id: routingConfig.id,
          owner: clientOwnerKey,
        },
      });
    });

    test('partial update - cascade with conditional templates', async () => {
      const { repo, mocks } = setup();

      const update: UpdateRoutingConfig = {
        cascade: [
          {
            cascadeGroups: ['translations'],
            channel: 'SMS',
            channelType: 'primary',
            defaultTemplateId: 'default-template-id',
            conditionalTemplates: [
              { templateId: 'conditional-template-1', language: 'ar' },
              { templateId: 'conditional-template-2', language: 'zh' },
            ],
          },
          {
            cascadeGroups: ['accessible'],
            channel: 'EMAIL',
            channelType: 'secondary',
            conditionalTemplates: [
              { templateId: 'accessible-template-1', accessibleFormat: 'x1' },
            ],
          },
        ],
        cascadeGroupOverrides: [
          { name: 'translations', language: ['ar', 'zh'] },
          { name: 'accessible', accessibleFormat: ['x1'] },
        ],
      };

      const updated: RoutingConfig = {
        ...routingConfig,
        ...update,
      };

      mocks.dynamo.on(TransactWriteCommand).resolves({});
      mocks.dynamo.on(GetCommand).resolves({ Item: updated });

      const result = await repo.update(routingConfig.id, update, user, 2);

      expect(result).toEqual({ data: updated });

      expect(mocks.dynamo).toHaveReceivedCommandWith(TransactWriteCommand, {
        TransactItems: [
          {
            Update: {
              ConditionExpression:
                '#status = :condition_1_status AND #lockNumber = :condition_2_lockNumber',
              ExpressionAttributeNames: {
                '#cascade': 'cascade',
                '#cascadeGroupOverrides': 'cascadeGroupOverrides',
                '#lockNumber': 'lockNumber',
                '#status': 'status',
                '#updatedAt': 'updatedAt',
                '#updatedBy': 'updatedBy',
              },
              ExpressionAttributeValues: {
                ':condition_1_status': 'DRAFT',
                ':condition_2_lockNumber': 2,
                ':lockNumber': 1,
                ':cascade': update.cascade,
                ':cascadeGroupOverrides': update.cascadeGroupOverrides,
                ':updatedAt': date.toISOString(),
                ':updatedBy': `INTERNAL_USER#${user.internalUserId}`,
              },
              Key: {
                id: routingConfig.id,
                owner: clientOwnerKey,
              },
              ReturnValues: 'ALL_NEW',
              ReturnValuesOnConditionCheckFailure:
                ReturnValuesOnConditionCheckFailure.ALL_OLD,
              TableName: TABLE_NAME,
              UpdateExpression:
                'SET #cascade = :cascade, #cascadeGroupOverrides = :cascadeGroupOverrides, #updatedAt = :updatedAt, #updatedBy = :updatedBy ADD #lockNumber :lockNumber',
            },
          },
          {
            ConditionCheck: {
              TableName: TEMPLATE_TABLE_NAME,
              Key: {
                id: 'default-template-id',
                owner: clientOwnerKey,
              },
              ConditionExpression: 'attribute_exists(id)',
            },
          },
          {
            ConditionCheck: {
              TableName: TEMPLATE_TABLE_NAME,
              Key: {
                id: 'conditional-template-1',
                owner: clientOwnerKey,
              },
              ConditionExpression: 'attribute_exists(id)',
            },
          },
          {
            ConditionCheck: {
              TableName: TEMPLATE_TABLE_NAME,
              Key: {
                id: 'conditional-template-2',
                owner: clientOwnerKey,
              },
              ConditionExpression: 'attribute_exists(id)',
            },
          },
          {
            ConditionCheck: {
              TableName: TEMPLATE_TABLE_NAME,
              Key: {
                id: 'accessible-template-1',
                owner: clientOwnerKey,
              },
              ConditionExpression: 'attribute_exists(id)',
            },
          },
        ],
      });

      expect(mocks.dynamo).toHaveReceivedCommandWith(GetCommand, {
        TableName: TABLE_NAME,
        Key: {
          id: routingConfig.id,
          owner: clientOwnerKey,
        },
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

      mocks.dynamo.on(TransactWriteCommand).resolves({});
      mocks.dynamo.on(GetCommand).resolves({ Item: updated });

      const result = await repo.update(routingConfig.id, update, user, 2);

      expect(result).toEqual({ data: updated });

      expect(mocks.dynamo).toHaveReceivedCommandWith(TransactWriteCommand, {
        TransactItems: [
          {
            Update: {
              ConditionExpression:
                '#status = :condition_1_status AND #lockNumber = :condition_2_lockNumber',
              ExpressionAttributeNames: {
                '#lockNumber': 'lockNumber',
                '#name': 'name',
                '#status': 'status',
                '#updatedAt': 'updatedAt',
                '#updatedBy': 'updatedBy',
              },
              ExpressionAttributeValues: {
                ':condition_1_status': 'DRAFT',
                ':condition_2_lockNumber': 2,
                ':lockNumber': 1,
                ':name': update.name,
                ':updatedAt': date.toISOString(),
                ':updatedBy': `INTERNAL_USER#${user.internalUserId}`,
              },
              Key: {
                id: routingConfig.id,
                owner: clientOwnerKey,
              },
              ReturnValues: 'ALL_NEW',
              ReturnValuesOnConditionCheckFailure:
                ReturnValuesOnConditionCheckFailure.ALL_OLD,
              TableName: TABLE_NAME,
              UpdateExpression:
                'SET #name = :name, #updatedAt = :updatedAt, #updatedBy = :updatedBy ADD #lockNumber :lockNumber',
            },
          },
          {
            ConditionCheck: {
              TableName: TEMPLATE_TABLE_NAME,
              Key: {
                id: 'c003b4f1-d788-423d-a948-0df511d07a23',
                owner: clientOwnerKey,
              },
              ConditionExpression: 'attribute_exists(id)',
            },
          },
        ],
      });

      expect(mocks.dynamo).toHaveReceivedCommandWith(GetCommand, {
        TableName: TABLE_NAME,
        Key: {
          id: routingConfig.id,
          owner: clientOwnerKey,
        },
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

      mocks.dynamo.on(TransactWriteCommand).resolves({});
      mocks.dynamo.on(GetCommand).resolves({ Item: updated });

      const result = await repo.update(routingConfig.id, update, user, 2);

      expect(result).toEqual({ data: updated });

      expect(mocks.dynamo).toHaveReceivedCommandWith(TransactWriteCommand, {
        TransactItems: [
          {
            Update: {
              ConditionExpression:
                '#status = :condition_1_status AND #lockNumber = :condition_2_lockNumber',
              ExpressionAttributeNames: {
                '#lockNumber': 'lockNumber',
                '#name': 'name',
                '#status': 'status',
                '#updatedAt': 'updatedAt',
                '#updatedBy': 'updatedBy',
              },
              ExpressionAttributeValues: {
                ':condition_1_status': 'DRAFT',
                ':condition_2_lockNumber': 2,
                ':lockNumber': 1,
                ':name': update.name,
                ':updatedAt': date.toISOString(),
                ':updatedBy': `INTERNAL_USER#${user.internalUserId}`,
              },
              Key: {
                id: routingConfig.id,
                owner: clientOwnerKey,
              },
              ReturnValues: 'ALL_NEW',
              ReturnValuesOnConditionCheckFailure:
                ReturnValuesOnConditionCheckFailure.ALL_OLD,
              TableName: TABLE_NAME,
              UpdateExpression:
                'SET #name = :name, #updatedAt = :updatedAt, #updatedBy = :updatedBy ADD #lockNumber :lockNumber',
            },
          },
        ],
      });

      expect(mocks.dynamo).toHaveReceivedCommandWith(GetCommand, {
        TableName: TABLE_NAME,
        Key: {
          id: routingConfig.id,
          owner: clientOwnerKey,
        },
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

      mocks.dynamo.on(TransactWriteCommand).resolves({});
      mocks.dynamo.on(GetCommand).resolves({ Item: routingConfig });

      const result = await repo.update(routingConfig.id, update, user, 2);

      expect(result).toEqual({ data: routingConfig });

      expect(mocks.dynamo).toHaveReceivedCommandWith(TransactWriteCommand, {
        TransactItems: [
          {
            Update: {
              ConditionExpression:
                '#status = :condition_1_status AND #lockNumber = :condition_2_lockNumber',
              ExpressionAttributeNames: {
                '#campaignId': 'campaignId',
                '#cascade': 'cascade',
                '#cascadeGroupOverrides': 'cascadeGroupOverrides',
                '#lockNumber': 'lockNumber',
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
                ':condition_2_lockNumber': 2,
                ':lockNumber': 1,
                ':name': update.name,
                ':updatedAt': date.toISOString(),
                ':updatedBy': `INTERNAL_USER#${user.internalUserId}`,
              },
              Key: {
                id: routingConfig.id,
                owner: clientOwnerKey,
              },
              ReturnValues: 'ALL_NEW',
              ReturnValuesOnConditionCheckFailure:
                ReturnValuesOnConditionCheckFailure.ALL_OLD,
              TableName: TABLE_NAME,
              UpdateExpression:
                'SET #name = :name, #campaignId = :campaignId, #cascade = :cascade, #cascadeGroupOverrides = :cascadeGroupOverrides, #updatedAt = :updatedAt, #updatedBy = :updatedBy ADD #lockNumber :lockNumber',
            },
          },
          {
            ConditionCheck: {
              TableName: TEMPLATE_TABLE_NAME,
              Key: {
                id: '90e46ece-4a3b-47bd-b781-f986b42a5a09',
                owner: clientOwnerKey,
              },
              ConditionExpression: 'attribute_exists(id)',
            },
          },
        ],
      });

      expect(mocks.dynamo).toHaveReceivedCommandWith(GetCommand, {
        TableName: TABLE_NAME,
        Key: {
          id: routingConfig.id,
          owner: clientOwnerKey,
        },
      });
    });

    test('returns failure on client error', async () => {
      const { repo, mocks } = setup();

      const err = new Error('ddb err');

      mocks.dynamo.on(TransactWriteCommand).rejects(err);

      const result = await repo.update(
        routingConfig.id,
        {
          cascade: routingConfig.cascade,
          cascadeGroupOverrides: routingConfig.cascadeGroupOverrides,
          name: routingConfig.name,
          campaignId: routingConfig.campaignId,
        },
        user,
        2
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

      mocks.dynamo.on(TransactWriteCommand).resolves({});
      mocks.dynamo.on(GetCommand).resolves({ Item: updatedInvalid });

      const result = await repo.update(
        routingConfig.id,
        {
          cascade: routingConfig.cascade,
          cascadeGroupOverrides: routingConfig.cascadeGroupOverrides,
          name: routingConfig.name,
          campaignId: routingConfig.campaignId,
        },
        user,
        2
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

      const err = new TransactionCanceledException({
        CancellationReasons: [
          {
            Code: 'ConditionalCheckFailed',
            // No Item for not found
          },
        ],
        $metadata: {},
        message: 'Transaction cancelled',
      });

      mocks.dynamo.on(TransactWriteCommand).rejects(err);

      const result = await repo.update(
        routingConfig.id,
        { name: 'new-name' },
        user,
        2
      );

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

      const err = new TransactionCanceledException({
        CancellationReasons: [
          {
            Code: 'ConditionalCheckFailed',
            Item: { status: { S: 'DELETED' satisfies RoutingConfigStatus } },
          },
        ],
        $metadata: {},
        message: 'Transaction cancelled',
      });

      mocks.dynamo.on(TransactWriteCommand).rejects(err);

      const result = await repo.update(
        routingConfig.id,
        { name: 'new-name' },
        user,
        2
      );

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

      const err = new TransactionCanceledException({
        CancellationReasons: [
          {
            Code: 'ConditionalCheckFailed',
            Item: { status: { S: 'COMPLETED' satisfies RoutingConfigStatus } },
          },
        ],
        $metadata: {},
        message: 'Transaction cancelled',
      });

      mocks.dynamo.on(TransactWriteCommand).rejects(err);

      const result = await repo.update(
        routingConfig.id,
        { name: 'new name' },
        user,
        2
      );

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

    test("returns 409 failure if routing config lock number doesn't match", async () => {
      const { repo, mocks } = setup();

      const err = new TransactionCanceledException({
        CancellationReasons: [
          {
            Code: 'ConditionalCheckFailed',
            Item: {
              status: { S: 'DRAFT' satisfies RoutingConfigStatus },
              lockNumber: { N: '3' },
            },
          },
        ],
        $metadata: {},
        message: 'Transaction cancelled',
      });

      mocks.dynamo.on(TransactWriteCommand).rejects(err);

      const result = await repo.update(
        routingConfig.id,
        { name: 'new-name' },
        user,
        2
      );

      expect(result).toEqual({
        error: {
          actualError: expect.any(ConditionalCheckFailedException),
          errorMeta: {
            code: 409,
            description:
              'Lock number mismatch - Message Plan has been modified since last read',
          },
        },
      });
    });

    test('returns 400 failure if some templates not found', async () => {
      const { repo, mocks } = setup();

      const err = new TransactionCanceledException({
        CancellationReasons: [
          {
            Code: 'None', // Update succeeded
          },
          {
            Code: 'ConditionalCheckFailed', // Template not found
          },
        ],
        $metadata: {},
        message: 'Transaction cancelled',
      });

      mocks.dynamo.on(TransactWriteCommand).rejects(err);

      const result = await repo.update(
        routingConfig.id,
        {
          name: 'new-name',
          cascade: [
            {
              cascadeGroups: ['standard'],
              channel: 'SMS',
              channelType: 'primary',
              defaultTemplateId: 'template1',
            },
          ],
          cascadeGroupOverrides: [],
        },
        user,
        2
      );

      expect(result).toEqual({
        error: {
          actualError: err,
          errorMeta: {
            code: 400,
            description: 'Some templates not found',
            details: { templateIds: 'template1' },
          },
        },
      });
    });

    test('returns 500 failure if GetCommand fails after TransactWriteCommand succeeds', async () => {
      const { repo, mocks } = setup();

      const err = new Error('GetCommand failed');

      mocks.dynamo.on(TransactWriteCommand).resolves({});
      mocks.dynamo.on(GetCommand).rejects(err);

      const result = await repo.update(
        routingConfig.id,
        { name: 'new-name' },
        user,
        2
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

    test('returns failure on TransactionCanceledException with undefined CancellationReasons', async () => {
      const { repo, mocks } = setup();

      const err = new TransactionCanceledException({
        CancellationReasons: undefined,
        $metadata: {},
        message: 'Transaction cancelled',
      });

      mocks.dynamo.on(TransactWriteCommand).rejects(err);

      const result = await repo.update(
        routingConfig.id,
        { name: 'new-name' },
        user,
        2
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
  });

  describe('getByTemplateId', () => {
    const templateId = 'd4e5f6a7-b8c9-40d1-ef23-456789abcdef';

    it('should return empty array when no routing configs reference the template ID', async () => {
      const { repo, mocks } = setup();

      const routingConfigWithoutTemplate = makeRoutingConfig({
        cascade: [
          {
            channel: 'EMAIL',
            channelType: 'primary',
            cascadeGroups: ['standard'],
            defaultTemplateId: 'c9b6d56b-421e-462f-9ce5-3012e3fdb27f', // different template
          },
        ],
      });

      mocks.dynamo.on(QueryCommand).resolvesOnce({
        Items: [routingConfigWithoutTemplate],
      });

      const result = await repo.getByTemplateId(templateId, user.clientId);

      expect(result.data).toEqual([]);
      expect(result.error).toBeUndefined();
    });

    it('should return routing config that references the template in defaultTemplateId', async () => {
      const { repo, mocks } = setup();

      const routingConfigWithTemplate = makeRoutingConfig({
        id: '90e46ece-4a3b-47bd-b781-f986b42a5a09',
        name: 'Message Plan 1',
        cascade: [
          {
            channel: 'EMAIL',
            channelType: 'primary',
            cascadeGroups: ['standard'],
            defaultTemplateId: templateId,
          },
        ],
      });

      mocks.dynamo.on(QueryCommand).resolvesOnce({
        Items: [routingConfigWithTemplate],
      });

      const result = await repo.getByTemplateId(templateId, user.clientId);

      expect(result.data).toEqual([
        {
          id: routingConfigWithTemplate.id,
          name: routingConfigWithTemplate.name,
        },
      ]);
      expect(result.error).toBeUndefined();
    });

    it('should return routing config that references the template in conditionalTemplates', async () => {
      const { repo, mocks } = setup();

      const routingConfigWithConditionalTemplate = makeRoutingConfig({
        id: 'a0e46ece-4a3b-47bd-b781-f986b42a5a10',
        name: 'Message Plan 2',
        cascade: [
          {
            channel: 'LETTER',
            channelType: 'primary',
            cascadeGroups: ['standard', 'translations'],
            defaultTemplateId: 'c9b6d56b-421e-462f-9ce5-3012e3fdb27f', // different template
            conditionalTemplates: [
              {
                language: 'fr',
                templateId,
              },
            ],
          },
        ],
      });

      mocks.dynamo.on(QueryCommand).resolvesOnce({
        Items: [routingConfigWithConditionalTemplate],
      });

      const result = await repo.getByTemplateId(templateId, user.clientId);

      expect(result.data).toEqual([
        {
          id: routingConfigWithConditionalTemplate.id,
          name: routingConfigWithConditionalTemplate.name,
        },
      ]);
      expect(result.error).toBeUndefined();
    });

    it('should return multiple routing configs that reference the template', async () => {
      const { repo, mocks } = setup();

      const routingConfig1 = makeRoutingConfig({
        id: '90e46ece-4a3b-47bd-b781-f986b42a5a09',
        name: 'Message Plan 1',
        cascade: [
          {
            channel: 'EMAIL',
            channelType: 'primary',
            cascadeGroups: ['standard'],
            defaultTemplateId: templateId,
          },
        ],
      });

      const routingConfig2 = makeRoutingConfig({
        id: 'a0e46ece-4a3b-47bd-b781-f986b42a5a10',
        name: 'Message Plan 2',
        cascade: [
          {
            channel: 'SMS',
            channelType: 'primary',
            cascadeGroups: ['standard'],
            defaultTemplateId: 'e5f6a7b8-c9d0-41e2-f012-3456789abcde',
          },
        ],
      });

      const routingConfig3 = makeRoutingConfig({
        id: 'b0e46ece-4a3b-47bd-8781-f986b42a5a15',
        name: 'Message Plan 3',
        cascade: [
          {
            channel: 'LETTER',
            channelType: 'primary',
            cascadeGroups: ['standard'],
            conditionalTemplates: [{ language: 'es', templateId: templateId }],
          },
        ],
      });

      mocks.dynamo.on(QueryCommand).resolvesOnce({
        Items: [routingConfig1, routingConfig2, routingConfig3],
      });

      const result = await repo.getByTemplateId(templateId, user.clientId);

      expect(result.data).toEqual([
        { id: routingConfig1.id, name: routingConfig1.name },
        { id: routingConfig3.id, name: routingConfig3.name },
      ]);
      expect(result.data).not.toContainEqual({
        id: routingConfig2.id,
        name: routingConfig2.name,
      });
      expect(result.error).toBeUndefined();
    });

    it('should return error when query fails', async () => {
      const { repo, mocks } = setup();

      mocks.dynamo.on(QueryCommand).rejectsOnce(new Error('DynamoDB error'));

      const result = await repo.getByTemplateId(templateId, user.clientId);

      expect(result.error).toBeDefined();
      expect(result.error?.errorMeta.code).toBe(500);
      expect(result.data).toBeUndefined();
    });
  });
});
