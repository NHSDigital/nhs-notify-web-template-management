import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { TemplateLockRepository } from '../../infra/template-lock-repository';
import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';

const templatesTableName = 'nhs-notify-main-app-api-templates';
const clientId = 'f6109f07-c31e-4b9a-b8eb-110d712b8342';
const templateId = '6b5a8b45-c4b0-4f32-aeca-9083406aa07f';
const mockDate = new Date('2025-04-14T16:04:16.016Z');
const sendLockTtlMs = 50_000;

function setup() {
  const client = mockClient(DynamoDBDocumentClient);

  const templateRepository = new TemplateLockRepository(
    client as unknown as DynamoDBDocumentClient,
    templatesTableName,
    () => mockDate,
    sendLockTtlMs
  );

  return { templateRepository, mocks: { client } };
}

describe('TemplateLockRepository', () => {
  describe('acquireLockAndSetSupplierReference', () => {
    test('returns true when database update succeeds', async () => {
      const { mocks, templateRepository } = setup();

      mocks.client.on(UpdateCommand).resolvesOnce({});

      const res = await templateRepository.acquireLockAndSetSupplierReference(
        clientId,
        templateId,
        'supplier',
        'supplier-reference'
      );

      expect(res).toBe(true);

      expect(mocks.client).toHaveReceivedCommandWith(UpdateCommand, {
        ExpressionAttributeNames: {
          '#sftpSendLockTime': 'sftpSendLockTime',
          '#supplier': 'supplier',
          '#supplierReferences': 'supplierReferences',
          '#lockNumber': 'lockNumber',
        },
        ExpressionAttributeValues: {
          ':condition_2_sftpSendLockTime': mockDate.getTime() + sendLockTtlMs,
          ':sftpSendLockTime': mockDate.getTime(),
          ':supplier': 'supplier-reference',
          ':lockNumber': 1,
        },
        ConditionExpression:
          'attribute_not_exists (#sftpSendLockTime) OR #sftpSendLockTime > :condition_2_sftpSendLockTime',
        Key: {
          id: templateId,
          owner: `CLIENT#${clientId}`,
        },
        TableName: templatesTableName,
        UpdateExpression:
          'SET #sftpSendLockTime = :sftpSendLockTime, #supplierReferences.#supplier = :supplier ADD #lockNumber :lockNumber',
      });
    });

    test('returns false when database update fails due to a ConditionalCheckFailedException', async () => {
      const { mocks, templateRepository } = setup();

      mocks.client.on(UpdateCommand).rejectsOnce(
        new ConditionalCheckFailedException({
          message: 'conditional check failed',
          $metadata: {},
        })
      );

      const res = await templateRepository.acquireLockAndSetSupplierReference(
        clientId,
        templateId,
        'supplier',
        'supplier-reference'
      );

      expect(res).toBe(false);
    });

    test('throws if database update fails for any other reason', async () => {
      const { mocks, templateRepository } = setup();

      mocks.client.on(UpdateCommand).rejectsOnce(new Error('unknown'));

      await expect(
        templateRepository.acquireLockAndSetSupplierReference(
          clientId,
          templateId,
          'supplier',
          'supplier-reference'
        )
      ).rejects.toThrow('unknown');
    });
  });

  describe('finaliseLock', () => {
    test('unconditionally sets lockTime to one month in the future', async () => {
      const { mocks, templateRepository } = setup();

      mocks.client.on(UpdateCommand).resolvesOnce({});

      await templateRepository.finaliseLock(clientId, templateId);

      expect(mocks.client).toHaveReceivedCommandWith(UpdateCommand, {
        ExpressionAttributeNames: {
          '#sftpSendLockTime': 'sftpSendLockTime',
          '#lockNumber': 'lockNumber',
        },
        ExpressionAttributeValues: {
          ':sftpSendLockTime': mockDate.getTime() + 2_592_000_000,
          ':lockNumber': 1,
        },
        Key: {
          id: templateId,
          owner: `CLIENT#${clientId}`,
        },
        TableName: templatesTableName,
        UpdateExpression:
          'SET #sftpSendLockTime = :sftpSendLockTime ADD #lockNumber :lockNumber',
      });
    });
  });
});
