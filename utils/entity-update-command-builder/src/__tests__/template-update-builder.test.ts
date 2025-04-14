import { TemplateStatus } from 'nhs-notify-backend-client';
import { TemplateUpdateBuilder } from '../template-update-builder';

const mockTableName = 'TABLE_NAME';
const mockOwner = 'Hello1';
const mockId = 'Hello2';
const mockDate = new Date('2025-01-01 09:00:00');

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(mockDate);
});

describe('TemplateBuilder', () => {
  describe('build', () => {
    test('after initialisation returns default update (updatedAt)', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder.build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwner,
          id: mockId,
        },
        ExpressionAttributeNames: { '#updatedAt': 'updatedAt' },
        ExpressionAttributeValues: {
          ':updatedAt': mockDate.toISOString(),
        },
        UpdateExpression: 'SET #updatedAt = :updatedAt',
      });
    });

    test('provide ReturnValuesOnConditionCheckFailure optional arg will modify output', () => {
      const builder = new TemplateUpdateBuilder(
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
          owner: mockOwner,
          id: mockId,
        },
        ExpressionAttributeNames: { '#updatedAt': 'updatedAt' },
        ExpressionAttributeValues: {
          ':updatedAt': mockDate.toISOString(),
        },
        UpdateExpression: 'SET #updatedAt = :updatedAt',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
      });
    });
  });

  describe('setStatus', () => {
    test('sets status field to provided TemplateStatus', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const status = 'NOT_YET_SUBMITTED';

      const res = builder.setStatus(status).build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwner,
          id: mockId,
        },
        ExpressionAttributeValues: {
          ':templateStatus': status,
          ':updatedAt': mockDate.toISOString(),
        },
        ExpressionAttributeNames: {
          '#templateStatus': 'templateStatus',
          '#updatedAt': 'updatedAt',
        },
        UpdateExpression:
          'SET #templateStatus = :templateStatus, #updatedAt = :updatedAt',
      });
    });

    test('sets status field to provided TemplateStatus and creates ConditionExpression with expected value', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const value = 'DELETED';
      const expected = 'NOT_YET_SUBMITTED';

      const res = builder.setStatus(value).expectedStatus(expected).build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwner,
          id: mockId,
        },
        ExpressionAttributeValues: {
          ':condition_1_templateStatus': 'NOT_YET_SUBMITTED',
          ':templateStatus': value,
          ':updatedAt': mockDate.toISOString(),
        },
        ExpressionAttributeNames: {
          '#templateStatus': 'templateStatus',
          '#updatedAt': 'updatedAt',
        },
        ConditionExpression: '#templateStatus = :condition_1_templateStatus',
        UpdateExpression:
          'SET #templateStatus = :templateStatus, #updatedAt = :updatedAt',
      });
    });

    test('allows array of expected statuses to be used', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const value = 'DELETED';
      const expected: TemplateStatus[] = [
        'NOT_YET_SUBMITTED',
        'PENDING_VALIDATION',
      ];

      const res = builder.setStatus(value).expectedStatus(expected).build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: {
          owner: mockOwner,
          id: mockId,
        },
        ExpressionAttributeValues: {
          ':condition_1_templateStatus': 'NOT_YET_SUBMITTED',
          ':condition_2_templateStatus': 'PENDING_VALIDATION',
          ':templateStatus': value,
          ':updatedAt': mockDate.toISOString(),
        },
        ExpressionAttributeNames: {
          '#templateStatus': 'templateStatus',
          '#updatedAt': 'updatedAt',
        },
        ConditionExpression:
          '#templateStatus IN (:condition_1_templateStatus, :condition_2_templateStatus)',
        UpdateExpression:
          'SET #templateStatus = :templateStatus, #updatedAt = :updatedAt',
      });
    });
  });

  describe('setLockTime', () => {
    test('sets lock time if no lock exists', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder.setLockTime(500).build();

      expect(res).toEqual({
        ConditionExpression: 'attribute_not_exists (#lockTime)',
        ExpressionAttributeNames: {
          '#lockTime': 'lockTime',
          '#updatedAt': 'updatedAt',
        },
        ExpressionAttributeValues: {
          ':lockTime': 500,
          ':updatedAt': '2025-01-01T09:00:00.000Z',
        },
        Key: {
          id: 'Hello2',
          owner: 'Hello1',
        },
        TableName: 'TABLE_NAME',
        UpdateExpression: 'SET #lockTime = :lockTime, #updatedAt = :updatedAt',
      });
    });

    test('sets lock time if no lock exists, or if the lock has expired, when lockExpiryTimeMs is provided', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder.setLockTime(1000, 1500).build();

      expect(res).toEqual({
        ConditionExpression:
          'attribute_not_exists (#lockTime) OR #lockTime > :condition_2_lockTime',
        ExpressionAttributeNames: {
          '#lockTime': 'lockTime',
          '#updatedAt': 'updatedAt',
        },
        ExpressionAttributeValues: {
          ':condition_2_lockTime': 1500,
          ':lockTime': 1000,
          ':updatedAt': '2025-01-01T09:00:00.000Z',
        },
        Key: {
          id: 'Hello2',
          owner: 'Hello1',
        },
        TableName: 'TABLE_NAME',
        UpdateExpression: 'SET #lockTime = :lockTime, #updatedAt = :updatedAt',
      });
    });
  });

  describe('removeLockTime', () => {
    test('clears lockTime attribute', () => {
      const builder = new TemplateUpdateBuilder(
        mockTableName,
        mockOwner,
        mockId
      );

      const res = builder.removeLockTime().build();

      expect(res).toEqual({
        ExpressionAttributeNames: {
          '#lockTime': 'lockTime',
          '#updatedAt': 'updatedAt',
        },
        ExpressionAttributeValues: {
          ':updatedAt': '2025-01-01T09:00:00.000Z',
        },
        Key: {
          id: 'Hello2',
          owner: 'Hello1',
        },
        TableName: 'TABLE_NAME',
        UpdateExpression: 'SET #updatedAt = :updatedAt REMOVE #lockTime',
      });
    });
  });
});
