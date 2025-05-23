import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { TemplateLockRepository } from '../../infra/template-lock-repository';
import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import { isoDateRegExp } from 'nhs-notify-web-template-management-test-helper-utils';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';

const templatesTableName = 'nhs-notify-main-app-api-templates';
const owner = 'f6109f07-c31e-4b9a-b8eb-110d712b8342';
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
  describe('acquireLock', () => {
    test('returns true when database update succeeds', async () => {
      const { mocks, templateRepository } = setup();

      mocks.client.on(UpdateCommand).resolvesOnce({});

      const res = await templateRepository.acquireLock(owner, templateId);

      expect(res).toBe(true);

      expect(mocks.client).toHaveReceivedCommandWith(UpdateCommand, {
        ExpressionAttributeNames: {
          '#updatedAt': 'updatedAt',
          '#sftpSendLockTime': 'sftpSendLockTime',
        },
        ExpressionAttributeValues: {
          ':condition_2_sftpSendLockTime': mockDate.getTime() + sendLockTtlMs,
          ':updatedAt': expect.stringMatching(isoDateRegExp),
          ':sftpSendLockTime': mockDate.getTime(),
        },
        ConditionExpression:
          'attribute_not_exists (#sftpSendLockTime) OR #sftpSendLockTime > :condition_2_sftpSendLockTime',
        Key: {
          id: templateId,
          owner,
        },
        TableName: templatesTableName,
        UpdateExpression:
          'SET #sftpSendLockTime = :sftpSendLockTime, #updatedAt = :updatedAt',
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

      const res = await templateRepository.acquireLock(owner, templateId);

      expect(res).toBe(false);
    });

    test('throws if database update fails for any other reason', async () => {
      const { mocks, templateRepository } = setup();

      mocks.client.on(UpdateCommand).rejectsOnce(new Error('unknown'));

      await expect(
        templateRepository.acquireLock(owner, templateId)
      ).rejects.toThrow('unknown');
    });
  });

  describe('finaliseLock', () => {
    test('unconditionally sets lockTime to one month in the future', async () => {
      const { mocks, templateRepository } = setup();

      mocks.client.on(UpdateCommand).resolvesOnce({});

      await templateRepository.finaliseLock(owner, templateId);

      expect(mocks.client).toHaveReceivedCommandWith(UpdateCommand, {
        ExpressionAttributeNames: {
          '#updatedAt': 'updatedAt',
          '#sftpSendLockTime': 'sftpSendLockTime',
        },
        ExpressionAttributeValues: {
          ':updatedAt': expect.any(String),
          ':sftpSendLockTime': mockDate.getTime() + 2_592_000_000,
        },
        Key: {
          id: templateId,
          owner,
        },
        TableName: templatesTableName,
        UpdateExpression:
          'SET #sftpSendLockTime = :sftpSendLockTime, #updatedAt = :updatedAt',
      });
    });
  });
});
