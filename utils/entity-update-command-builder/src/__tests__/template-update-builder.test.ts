import { TemplateStatus } from 'nhs-notify-backend-client';
import { TemplateUpdateBuilder } from '../template-update-builder';

const mockTableName = 'TABLE_NAME';
const mockOwner = 'Hello1';
const mockId = 'Hello2';

describe('TemplateBuilder', () => {
  describe('build', () => {
    test('returns empty expression when built after initialisation', () => {
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
        ExpressionAttributeNames: {},
        UpdateExpression: '',
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
        ExpressionAttributeNames: {},
        UpdateExpression: '',
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
        },
        ExpressionAttributeNames: {
          '#templateStatus': 'templateStatus',
        },
        UpdateExpression: 'SET #templateStatus = :templateStatus',
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
        },
        ExpressionAttributeNames: {
          '#templateStatus': 'templateStatus',
        },
        ConditionExpression: '#templateStatus = :condition_1_templateStatus',
        UpdateExpression: 'SET #templateStatus = :templateStatus',
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
        },
        ExpressionAttributeNames: {
          '#templateStatus': 'templateStatus',
        },
        ConditionExpression:
          '#templateStatus IN (:condition_1_templateStatus, :condition_2_templateStatus)',
        UpdateExpression: 'SET #templateStatus = :templateStatus',
      });
    });
  });
});
