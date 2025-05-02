import { EntityUpdateBuilder } from '../../common/entity-update-builder';

const mockTableName = 'TABLE_NAME';
const mockEntityKeys = {
  PK: 'Hello1',
  SK: 'Hello2',
};

describe('EntityUpdateBuilder', () => {
  describe('build', () => {
    test('returns empty expression when built after initialisation', () => {
      const builder = new EntityUpdateBuilder(mockTableName, mockEntityKeys);

      const res = builder.build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: mockEntityKeys,
        ExpressionAttributeNames: {},
        UpdateExpression: '',
      });
    });
    test('provide ReturnValuesOnConditionCheckFailure optional arg will modify output', () => {
      const builder = new EntityUpdateBuilder(mockTableName, mockEntityKeys, {
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
      });

      const res = builder.build();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: mockEntityKeys,
        ExpressionAttributeNames: {},
        UpdateExpression: '',
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
      });
    });
  });
});
