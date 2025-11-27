import { CascadeGroup, CascadeItem } from 'nhs-notify-backend-client';
import { RoutingConfigUpdateBuilder } from '../routing-config-update-builder';

const mockTableName = 'TABLE_NAME';
const mockOwner = 'Hello1';
const mockOwnerKey = `CLIENT#${mockOwner}`;
const mockId = 'Hello2';
const mockDate = new Date('2025-01-01 09:00:00');

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(mockDate);
});

describe('RoutingConfigUpdateBuilder', () => {
  describe('build', () => {
    test('after initialisation returns empty update', () => {
      const builder = new RoutingConfigUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder.build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwnerKey,
          id: mockId,
        },
        ExpressionAttributeNames: {},
        UpdateExpression: '',
      });
    });

    test('provide ReturnValuesOnConditionCheckFailure optional arg will modify output', () => {
      const builder = new RoutingConfigUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId,
        {
          ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
        }
      );

      const res = builder.build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwnerKey,
          id: mockId,
        },
        ExpressionAttributeNames: {},
        UpdateExpression: '',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
      });
    });
  });

  describe('setStatus', () => {
    test('sets status field to provided status', () => {
      const builder = new RoutingConfigUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const status = 'DELETED';

      const res = builder.setStatus(status).build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwnerKey,
          id: mockId,
        },
        ExpressionAttributeValues: {
          ':status': status,
        },
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        UpdateExpression: 'SET #status = :status',
      });
    });

    test('sets status field to provided status and creates ConditionExpression with expected value', () => {
      const builder = new RoutingConfigUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const value = 'DELETED';
      const expected = 'DRAFT';

      const res = builder.setStatus(value).expectStatus(expected).build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwnerKey,
          id: mockId,
        },
        ExpressionAttributeValues: {
          ':condition_1_status': 'DRAFT',
          ':status': value,
        },
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ConditionExpression: '#status = :condition_1_status',
        UpdateExpression: 'SET #status = :status',
      });
    });
  });

  describe('setCampaignId', () => {
    test('sets campaignId field', () => {
      const builder = new RoutingConfigUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder.setCampaignId('my_campaign').build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwnerKey,
          id: mockId,
        },
        ExpressionAttributeValues: {
          ':campaignId': 'my_campaign',
        },
        ExpressionAttributeNames: {
          '#campaignId': 'campaignId',
        },
        UpdateExpression: 'SET #campaignId = :campaignId',
      });
    });
  });

  describe('setName', () => {
    test('sets name field', () => {
      const builder = new RoutingConfigUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder.setName('rc_name').build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwnerKey,
          id: mockId,
        },
        ExpressionAttributeValues: {
          ':name': 'rc_name',
        },
        ExpressionAttributeNames: {
          '#name': 'name',
        },
        UpdateExpression: 'SET #name = :name',
      });
    });
  });

  describe('setCascade', () => {
    test('sets cascade field', () => {
      const builder = new RoutingConfigUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const cascade: CascadeItem[] = [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: 'template_id',
        },
      ];

      const res = builder.setCascade(cascade).build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwnerKey,
          id: mockId,
        },
        ExpressionAttributeValues: {
          ':cascade': cascade,
        },
        ExpressionAttributeNames: {
          '#cascade': 'cascade',
        },
        UpdateExpression: 'SET #cascade = :cascade',
      });
    });
  });

  describe('setCascadeGroupOverrides', () => {
    test('sets cascadeGroupOverrides field', () => {
      const builder = new RoutingConfigUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const cascadeGroupOverrides: CascadeGroup[] = [
        {
          name: 'translations',
          language: ['pl'],
        },
      ];

      const res = builder
        .setCascadeGroupOverrides(cascadeGroupOverrides)
        .build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwnerKey,
          id: mockId,
        },
        ExpressionAttributeValues: {
          ':cascadeGroupOverrides': cascadeGroupOverrides,
        },
        ExpressionAttributeNames: {
          '#cascadeGroupOverrides': 'cascadeGroupOverrides',
        },
        UpdateExpression: 'SET #cascadeGroupOverrides = :cascadeGroupOverrides',
      });
    });
  });

  describe('setUpdatedByUserAt', () => {
    test('sets updatedBy and updatedAt', () => {
      const builder = new RoutingConfigUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder.setUpdatedByUserAt('userId').build();

      expect(res).toEqual({
        ExpressionAttributeNames: {
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy',
        },
        ExpressionAttributeValues: {
          ':updatedAt': mockDate.toISOString(),
          ':updatedBy': 'userId',
        },
        Key: {
          id: mockId,
          owner: mockOwnerKey,
        },
        TableName: 'TABLE_NAME',
        UpdateExpression:
          'SET #updatedAt = :updatedAt, #updatedBy = :updatedBy',
      });
    });
  });

  describe('setTtl', () => {
    test('sets ttl', () => {
      const builder = new RoutingConfigUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder.setTtl(90_000).build();

      expect(res).toEqual({
        ExpressionAttributeNames: {
          '#ttl': 'ttl',
        },
        ExpressionAttributeValues: {
          ':ttl': 90_000,
        },
        Key: {
          id: mockId,
          owner: mockOwnerKey,
        },
        TableName: 'TABLE_NAME',
        UpdateExpression: 'SET #ttl = :ttl',
      });
    });
  });

  describe('expectRoutingConfigExists', () => {
    test('adds condition', () => {
      const builder = new RoutingConfigUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder
        .setStatus('COMPLETED')
        .expectRoutingConfigExists()
        .build();

      expect(res).toEqual({
        ExpressionAttributeNames: {
          '#id': 'id',
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': 'COMPLETED',
        },
        ConditionExpression: 'attribute_exists (#id)',
        Key: {
          id: mockId,
          owner: mockOwnerKey,
        },
        TableName: 'TABLE_NAME',
        UpdateExpression: 'SET #status = :status',
      });
    });
  });

  describe('expectLockNumber', () => {
    test('adds condition for existing lock number', () => {
      const builder = new RoutingConfigUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder.setStatus('COMPLETED').expectLockNumber(5).build();

      expect(res).toEqual({
        ExpressionAttributeNames: {
          '#lockNumber': 'lockNumber',
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':condition_1_lockNumber': 5,
          ':status': 'COMPLETED',
        },
        ConditionExpression: '#lockNumber = :condition_1_lockNumber',
        Key: {
          id: mockId,
          owner: mockOwnerKey,
        },
        TableName: 'TABLE_NAME',
        UpdateExpression: 'SET #status = :status',
      });
    });
  });

  describe('incrementLockNumber', () => {
    test('increments lock number by 1', () => {
      const builder = new RoutingConfigUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder.incrementLockNumber().build();

      expect(res).toEqual({
        ExpressionAttributeNames: {
          '#lockNumber': 'lockNumber',
        },
        ExpressionAttributeValues: {
          ':lockNumber': 1,
        },
        Key: {
          id: mockId,
          owner: mockOwnerKey,
        },
        TableName: 'TABLE_NAME',
        UpdateExpression: 'ADD #lockNumber :lockNumber',
      });
    });
  });
});
