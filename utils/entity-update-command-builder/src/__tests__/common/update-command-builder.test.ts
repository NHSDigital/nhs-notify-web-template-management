import { UpdateCommandBuilder } from '../../common/update-command-builder';
import {
  ConditionFnOperator,
  ConditionJoiner,
  ConditionOperator,
  ConditionSpecialOperator,
} from '../../types/builders';

const mockTableName = 'TABLE_NAME';
const mockEntityKeys = {
  PK: 'Hello1',
  SK: 'Hello2',
};

describe('UpdateExpressionBuilder', () => {
  describe('setValue', () => {
    test('fields are correctly populated when performing single set', () => {
      const builder = new UpdateCommandBuilder<Record<string, string>>(
        mockTableName,
        mockEntityKeys
      );

      const attributeName = 'ATTRIBUTE';
      const attributeValue = 'VALUE';

      const res = builder.setValue(attributeName, attributeValue).finalise();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: mockEntityKeys,
        ExpressionAttributeValues: {
          [`:${attributeName}`]: attributeValue,
        },
        ExpressionAttributeNames: {
          [`#${attributeName}`]: attributeName,
        },
        UpdateExpression: `SET #${attributeName} = :${attributeName}`,
      });
    });

    test('can set multiple attributes', () => {
      const builder = new UpdateCommandBuilder<Record<string, string>>(
        mockTableName,
        mockEntityKeys
      );

      const attribute1Name = 'ATTRIBUTE1';
      const attribute2Name = 'ATTRIBUTE2';

      const attribute1Value = 'VALUE1';
      const attribute2Value = 'VALUE2';

      const res = builder
        .setValue(attribute1Name, attribute1Value)
        .setValue(attribute2Name, attribute2Value)
        .finalise();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: mockEntityKeys,
        ExpressionAttributeValues: {
          [`:${attribute1Name}`]: attribute1Value,
          [`:${attribute2Name}`]: attribute2Value,
        },
        ExpressionAttributeNames: {
          [`#${attribute1Name}`]: attribute1Name,
          [`#${attribute2Name}`]: attribute2Name,
        },
        UpdateExpression: `SET #${attribute1Name} = :${attribute1Name}, #${attribute2Name} = :${attribute2Name}`,
      });
    });

    test('chaining setValue with same attribute but different value overwrites previous update', () => {
      const builder = new UpdateCommandBuilder<Record<string, string>>(
        mockTableName,
        mockEntityKeys
      );

      const attribute1Name = 'ATTRIBUTE1';
      const attribute2Name = 'ATTRIBUTE2';

      const attribute1Value = 'VALUE1';
      const attribute1Value2 = 'VALUE2';
      const attribute2Value = 'VALUE3';

      const res = builder
        .setValue(attribute1Name, attribute1Value)
        .setValue(attribute2Name, attribute2Value)
        .setValue(attribute1Name, attribute1Value2)
        .finalise();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: mockEntityKeys,
        ExpressionAttributeValues: {
          [`:${attribute1Name}`]: attribute1Value2,
          [`:${attribute2Name}`]: attribute2Value,
        },
        ExpressionAttributeNames: {
          [`#${attribute1Name}`]: attribute1Name,
          [`#${attribute2Name}`]: attribute2Name,
        },
        UpdateExpression: `SET #${attribute1Name} = :${attribute1Name}, #${attribute2Name} = :${attribute2Name}`,
      });
    });
  });

  describe('conditions', () => {
    const operandTestCases: [op: ConditionOperator, negated: boolean][] = [
      ['<', false],
      ['>', true],
      ['=', false],
      ['<>', true],
      ['>=', false],
      ['<=', false],
    ];

    test.each(operandTestCases)(
      'can create condition with %s operand when negation is %s',
      (operand, negated) => {
        const builder = new UpdateCommandBuilder<Record<string, string>>(
          mockTableName,
          mockEntityKeys
        );

        const attributeName = 'ATTRIBUTE';
        const attributeValue = 'VALUE';
        const attributeExpectedValue = 'VALUE_1';

        const res = builder
          .setValue(attributeName, attributeValue)
          .andCondition(attributeName, operand, attributeExpectedValue, negated)
          .finalise();

        const expectedCondition = negated
          ? `NOT #${attributeName} ${operand} :condition_1_${attributeName}`
          : `#${attributeName} ${operand} :condition_1_${attributeName}`;

        expect(res).toEqual({
          TableName: mockTableName,
          Key: mockEntityKeys,
          ConditionExpression: expectedCondition,
          ExpressionAttributeValues: {
            [`:${attributeName}`]: attributeValue,
            [`:condition_1_${attributeName}`]: attributeExpectedValue,
          },
          ExpressionAttributeNames: {
            [`#${attributeName}`]: attributeName,
          },
          UpdateExpression: `SET #${attributeName} = :${attributeName}`,
        });
      }
    );
  });

  describe('function conditions', () => {
    const unaryFunctionTestCases: [
      op: ConditionFnOperator,
      negated: boolean,
    ][] = [
      ['attribute_not_exists', true],
      ['attribute_exists', false],
    ];

    test.each(unaryFunctionTestCases)(
      'can create condition with %s unary function',
      (fn, negated) => {
        const builder = new UpdateCommandBuilder<Record<string, string>>(
          mockTableName,
          mockEntityKeys
        );

        const attributeName = 'ATTRIBUTE';
        const attributeValue = 'VALUE';
        const secondArg = undefined;

        const res = builder
          .setValue(attributeName, attributeValue)
          .fnCondition(fn, attributeName, secondArg, negated)
          .finalise();

        const expectedCondition = negated
          ? `NOT ${fn} (#${attributeName})`
          : `${fn} (#${attributeName})`;

        expect(res).toEqual({
          TableName: mockTableName,
          Key: mockEntityKeys,
          ConditionExpression: expectedCondition,
          ExpressionAttributeValues: {
            [`:${attributeName}`]: attributeValue,
          },
          ExpressionAttributeNames: {
            [`#${attributeName}`]: attributeName,
          },
          UpdateExpression: `SET #${attributeName} = :${attributeName}`,
        });
      }
    );

    const binaryFunctionTestCases: [
      op: ConditionFnOperator,
      negated: boolean,
    ][] = [
      ['attribute_type', false],
      ['begins_with', true],
      ['contains', false],
    ];

    test.each(binaryFunctionTestCases)(
      'can create condition with %s binary function',
      (fn, negated) => {
        const builder = new UpdateCommandBuilder<Record<string, string>>(
          mockTableName,
          mockEntityKeys
        );

        const attributeName = 'ATTRIBUTE';
        const attributeValue = 'VALUE';
        const secondArg = 'ARG';

        const res = builder
          .setValue(attributeName, attributeValue)
          .fnCondition(fn, attributeName, secondArg, negated)
          .finalise();

        const expectedCondition = negated
          ? `NOT ${fn} (#${attributeName}, :condition_1_${attributeName})`
          : `${fn} (#${attributeName}, :condition_1_${attributeName})`;

        expect(res).toEqual({
          TableName: mockTableName,
          Key: mockEntityKeys,
          ConditionExpression: expectedCondition,
          ExpressionAttributeValues: {
            [`:${attributeName}`]: attributeValue,
            [`:condition_1_${attributeName}`]: secondArg,
          },
          ExpressionAttributeNames: {
            [`#${attributeName}`]: attributeName,
          },
          UpdateExpression: `SET #${attributeName} = :${attributeName}`,
        });
      }
    );
  });

  describe('chainedConditions', () => {
    const multipleConditionTestCases: Array<
      [ConditionJoiner, ConditionJoiner, ConditionJoiner]
    > = [
      ['AND', 'AND', 'AND'],
      ['AND', 'OR', 'OR'],
      ['OR', 'OR', 'OR'],
      ['OR', 'AND', 'AND'],
    ];

    test.each(multipleConditionTestCases)(
      'standard condition chaining: when %s is chained by %s, an %s joiner is used',
      (conditionJoiner1, conditionJoiner2, joiner) => {
        const builder = new UpdateCommandBuilder<Record<string, string>>(
          mockTableName,
          mockEntityKeys
        );

        const attributeName = 'ATTRIBUTE1';

        const attributeValue = 'VALUE1';
        const attributeExpectedValue1 = 'EXPECTED_VALUE1';
        const attributeExpectedValue2 = 'EXPECTED_VALUE2';

        builder.setValue(attributeName, attributeValue);

        switch (conditionJoiner1) {
          case 'AND': {
            builder.andCondition(attributeName, '=', attributeExpectedValue1);
            break;
          }
          case 'OR': {
            builder.orCondition(attributeName, '=', attributeExpectedValue1);
            break;
          }
          default: {
            throw new Error('Unexpected case');
          }
        }

        switch (conditionJoiner2) {
          case 'AND': {
            builder.andCondition(attributeName, '>', attributeExpectedValue2);
            break;
          }
          case 'OR': {
            builder.orCondition(attributeName, '>', attributeExpectedValue2);
            break;
          }
          default: {
            throw new Error('Unexpected case');
          }
        }

        const res = builder.finalise();

        expect(res).toEqual({
          ConditionExpression: `#ATTRIBUTE1 = :condition_1_ATTRIBUTE1 ${joiner} #ATTRIBUTE1 > :condition_2_ATTRIBUTE1`,
          ExpressionAttributeNames: {
            '#ATTRIBUTE1': 'ATTRIBUTE1',
          },
          ExpressionAttributeValues: {
            ':ATTRIBUTE1': attributeValue,
            ':condition_1_ATTRIBUTE1': attributeExpectedValue1,
            ':condition_2_ATTRIBUTE1': attributeExpectedValue2,
          },
          Key: mockEntityKeys,
          TableName: mockTableName,
          UpdateExpression: 'SET #ATTRIBUTE1 = :ATTRIBUTE1',
        });
      }
    );

    const inConditionTestCases: Array<{
      firstCall: ConditionJoiner | ConditionSpecialOperator;
      secondCall: ConditionJoiner | ConditionSpecialOperator;
      secondCallNegated: boolean;
      expectedJoiner: ConditionJoiner;
      expectedFirstCondition: string;
      expectedSecondCondition: string;
    }> = [
      {
        firstCall: 'IN',
        secondCall: 'AND',
        secondCallNegated: true,
        expectedJoiner: 'AND',
        expectedFirstCondition: '#ATTRIBUTE1 IN (:condition_1_ATTRIBUTE1)',
        expectedSecondCondition: 'NOT #ATTRIBUTE1 > :condition_2_ATTRIBUTE1',
      },
      {
        firstCall: 'IN',
        secondCall: 'OR',
        secondCallNegated: false,
        expectedJoiner: 'OR',
        expectedFirstCondition: '#ATTRIBUTE1 IN (:condition_1_ATTRIBUTE1)',
        expectedSecondCondition: '#ATTRIBUTE1 > :condition_2_ATTRIBUTE1',
      },
      {
        firstCall: 'IN',
        secondCall: 'IN',
        secondCallNegated: true,
        expectedJoiner: 'AND',
        expectedFirstCondition: '#ATTRIBUTE1 IN (:condition_1_ATTRIBUTE1)',
        expectedSecondCondition: 'NOT #ATTRIBUTE1 IN (:condition_2_ATTRIBUTE1)',
      },
      {
        firstCall: 'AND',
        secondCall: 'IN',
        secondCallNegated: false,
        expectedJoiner: 'AND',
        expectedFirstCondition: '#ATTRIBUTE1 = :condition_1_ATTRIBUTE1',
        expectedSecondCondition: '#ATTRIBUTE1 IN (:condition_2_ATTRIBUTE1)',
      },
      {
        firstCall: 'OR',
        secondCall: 'IN',
        secondCallNegated: false,
        expectedJoiner: 'AND',
        expectedFirstCondition: '#ATTRIBUTE1 = :condition_1_ATTRIBUTE1',
        expectedSecondCondition: '#ATTRIBUTE1 IN (:condition_2_ATTRIBUTE1)',
      },
    ];

    test.each(inConditionTestCases)(
      'IN condition chaining: when %s is chained by %s, and second condition negated is %s, an %s joiner is used',
      ({
        firstCall,
        secondCall,
        secondCallNegated,
        expectedJoiner,
        expectedFirstCondition,
        expectedSecondCondition,
      }) => {
        const builder = new UpdateCommandBuilder<Record<string, string>>(
          mockTableName,
          mockEntityKeys
        );

        const attributeName = 'ATTRIBUTE1';

        const attributeValue = 'VALUE1';
        const attributeExpectedValue1 = 'EXPECTED_VALUE1';
        const attributeExpectedValue2 = 'EXPECTED_VALUE2';

        builder.setValue(attributeName, attributeValue);

        switch (firstCall) {
          case 'AND': {
            builder.andCondition(attributeName, '=', attributeExpectedValue1);
            break;
          }
          case 'OR': {
            builder.orCondition(attributeName, '=', attributeExpectedValue1);
            break;
          }
          case 'IN': {
            builder.inCondition(attributeName, attributeExpectedValue1);
            break;
          }
          default: {
            throw new Error('Unexpected case');
          }
        }

        switch (secondCall) {
          case 'AND': {
            builder.andCondition(
              attributeName,
              '>',
              attributeExpectedValue2,
              secondCallNegated
            );
            break;
          }
          case 'OR': {
            builder.orCondition(
              attributeName,
              '>',
              attributeExpectedValue2,
              secondCallNegated
            );
            break;
          }
          case 'IN': {
            builder.inCondition(
              attributeName,
              attributeExpectedValue2,
              secondCallNegated
            );
            break;
          }
          default: {
            throw new Error('Unexpected case');
          }
        }

        const res = builder.finalise();

        expect(res).toEqual({
          ConditionExpression: `${expectedFirstCondition} ${expectedJoiner} ${expectedSecondCondition}`,
          ExpressionAttributeNames: {
            '#ATTRIBUTE1': 'ATTRIBUTE1',
          },
          ExpressionAttributeValues: {
            ':ATTRIBUTE1': attributeValue,
            ':condition_1_ATTRIBUTE1': attributeExpectedValue1,
            ':condition_2_ATTRIBUTE1': attributeExpectedValue2,
          },
          Key: mockEntityKeys,
          TableName: mockTableName,
          UpdateExpression: 'SET #ATTRIBUTE1 = :ATTRIBUTE1',
        });
      }
    );

    test('function condition chaining: when contains is negated and chained by AND. (the joiner is AND)', () => {
      const attributeName = 'ATTRIBUTE1';
      const expectContained = 'STRING';

      const attributeValue = 'VALUE1';
      const attributeExpectedValue = 'EXPECTED_VALUE1';

      const builder = new UpdateCommandBuilder<Record<string, string>>(
        mockTableName,
        mockEntityKeys
      )
        .setValue(attributeName, attributeValue)
        .fnCondition('contains', attributeName, expectContained, true)
        .andCondition(attributeName, '=', attributeExpectedValue);

      const res = builder.finalise();

      expect(res).toEqual({
        ConditionExpression:
          'NOT contains (#ATTRIBUTE1, :condition_1_ATTRIBUTE1) AND #ATTRIBUTE1 = :condition_2_ATTRIBUTE1',
        ExpressionAttributeNames: {
          '#ATTRIBUTE1': attributeName,
        },
        ExpressionAttributeValues: {
          ':ATTRIBUTE1': attributeValue,
          ':condition_1_ATTRIBUTE1': expectContained,
          ':condition_2_ATTRIBUTE1': attributeExpectedValue,
        },
        Key: mockEntityKeys,
        TableName: mockTableName,
        UpdateExpression: 'SET #ATTRIBUTE1 = :ATTRIBUTE1',
      });
    });

    test('function condition chaining: AND is chained by attribute_exists (negated). (the joiner is AND)', () => {
      const attributeName = 'ATTRIBUTE1';
      const attributeName2 = 'ATTRIBUTE2';
      const attributeValue = 'VALUE1';
      const attributeExpectedValue = 'EXPECTED_VALUE1';

      const builder = new UpdateCommandBuilder<Record<string, string>>(
        mockTableName,
        mockEntityKeys
      )
        .setValue(attributeName, attributeValue)
        .andCondition(attributeName, '=', attributeExpectedValue)
        .fnCondition('attribute_exists', attributeName2, undefined, true);

      const res = builder.finalise();

      expect(res).toEqual({
        ConditionExpression:
          '#ATTRIBUTE1 = :condition_1_ATTRIBUTE1 AND NOT attribute_exists (#ATTRIBUTE2)',
        ExpressionAttributeNames: {
          '#ATTRIBUTE1': attributeName,
          '#ATTRIBUTE2': attributeName2,
        },
        ExpressionAttributeValues: {
          ':ATTRIBUTE1': attributeValue,
          ':condition_1_ATTRIBUTE1': attributeExpectedValue,
        },
        Key: mockEntityKeys,
        TableName: mockTableName,
        UpdateExpression: 'SET #ATTRIBUTE1 = :ATTRIBUTE1',
      });
    });

    const optionalJoinerOverrideTestCases: Array<
      [ConditionJoiner, ConditionJoiner, ConditionJoiner]
    > = [
      ['AND', 'OR', 'OR'],
      ['OR', 'AND', 'AND'],
    ];

    test.each(optionalJoinerOverrideTestCases)(
      'when %s is chained by IN with %s optional arg, an %s joiner is used',
      (firstCall, optionalArg, joiner) => {
        const builder = new UpdateCommandBuilder<Record<string, string>>(
          mockTableName,
          mockEntityKeys
        );

        const attributeName = 'ATTRIBUTE1';

        const attributeValue = 'VALUE1';
        const attributeExpectedValue1 = 'EXPECTED_VALUE1';
        const attributeExpectedValue2 = 'EXPECTED_VALUE2';

        builder.setValue(attributeName, attributeValue);

        switch (firstCall) {
          case 'AND': {
            builder.andCondition(attributeName, '=', attributeExpectedValue1);
            break;
          }
          case 'OR': {
            builder.orCondition(attributeName, '=', attributeExpectedValue1);
            break;
          }
          default: {
            throw new Error('Unexpected case');
          }
        }

        builder.inCondition(
          attributeName,
          attributeExpectedValue2,
          false,
          optionalArg
        );

        const res = builder.finalise();

        expect(res).toEqual({
          ConditionExpression: `#ATTRIBUTE1 = :condition_1_ATTRIBUTE1 ${joiner} #ATTRIBUTE1 IN (:condition_2_ATTRIBUTE1)`,
          ExpressionAttributeNames: {
            '#ATTRIBUTE1': 'ATTRIBUTE1',
          },
          ExpressionAttributeValues: {
            ':ATTRIBUTE1': attributeValue,
            ':condition_1_ATTRIBUTE1': attributeExpectedValue1,
            ':condition_2_ATTRIBUTE1': attributeExpectedValue2,
          },
          Key: mockEntityKeys,
          TableName: mockTableName,
          UpdateExpression: 'SET #ATTRIBUTE1 = :ATTRIBUTE1',
        });
      }
    );

    test('Function condition follows an IN condition, and provides a joiner override', () => {
      const attributeName = 'ATTRIBUTE1';
      const attributeValue = 'VALUE1';
      const attributeExpectedArray = ['EXPECTED_VALUE1'];
      const attributeExpectedType = 'S';

      const builder = new UpdateCommandBuilder<Record<string, string>>(
        mockTableName,
        mockEntityKeys
      )
        .setValue(attributeName, attributeValue)
        .inCondition(attributeName, attributeExpectedArray, true)
        .fnCondition(
          'attribute_type',
          attributeName,
          attributeExpectedType,
          false,
          'OR'
        );

      const res = builder.finalise();

      expect(res).toEqual({
        ConditionExpression:
          'NOT #ATTRIBUTE1 IN (:condition_1_ATTRIBUTE1) OR attribute_type (#ATTRIBUTE1, :condition_2_ATTRIBUTE1)',
        ExpressionAttributeNames: {
          '#ATTRIBUTE1': attributeName,
        },
        ExpressionAttributeValues: {
          ':ATTRIBUTE1': attributeValue,
          ':condition_1_ATTRIBUTE1': 'EXPECTED_VALUE1',
          ':condition_2_ATTRIBUTE1': 'S',
        },
        Key: mockEntityKeys,
        TableName: mockTableName,
        UpdateExpression: 'SET #ATTRIBUTE1 = :ATTRIBUTE1',
      });
    });
  });

  describe('setValueInList', () => {
    test('fields are correctly populated when performing single set with value', () => {
      const builder = new UpdateCommandBuilder<Record<string, string[]>>(
        mockTableName,
        mockEntityKeys
      );

      const attributeName = 'ATTRIBUTE';
      const value = ['VALUE'];

      const res = builder.setValueInList(attributeName, value).finalise();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: mockEntityKeys,
        ExpressionAttributeValues: {
          [`:${attributeName}`]: value,
        },
        ExpressionAttributeNames: {
          [`#${attributeName}`]: attributeName,
        },
        UpdateExpression: `SET #${attributeName} = list_append(#${attributeName}, :${attributeName})`,
      });
    });

    test('fields are correctly populated when performing single set with array of values', () => {
      const builder = new UpdateCommandBuilder<Record<string, string[]>>(
        mockTableName,
        mockEntityKeys
      );

      const attributeName = 'ATTRIBUTE';
      const values = ['VALUE1', 'VALUE2'];

      const res = builder.setValueInList(attributeName, values).finalise();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: mockEntityKeys,
        ExpressionAttributeValues: {
          [`:${attributeName}`]: values,
        },
        ExpressionAttributeNames: {
          [`#${attributeName}`]: attributeName,
        },
        UpdateExpression: `SET #${attributeName} = list_append(#${attributeName}, :${attributeName})`,
      });
    });

    test('can set multiple attributes', () => {
      const builder = new UpdateCommandBuilder<Record<string, string[]>>(
        mockTableName,
        mockEntityKeys
      );

      const attribute1Name = 'ATTRIBUTE1';
      const attribute2Name = 'ATTRIBUTE2';

      const attribute1Value = ['VALUE1'];
      const attribute2Value = ['VALUE2'];

      const res = builder
        .setValueInList(attribute1Name, attribute1Value)
        .setValueInList(attribute2Name, attribute2Value)
        .finalise();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: mockEntityKeys,
        ExpressionAttributeValues: {
          [`:${attribute1Name}`]: attribute1Value,
          [`:${attribute2Name}`]: attribute2Value,
        },
        ExpressionAttributeNames: {
          [`#${attribute1Name}`]: attribute1Name,
          [`#${attribute2Name}`]: attribute2Name,
        },
        UpdateExpression: `SET #${attribute1Name} = list_append(#${attribute1Name}, :${attribute1Name}), #${attribute2Name} = list_append(#${attribute2Name}, :${attribute2Name})`,
      });
    });

    test('chaining setValueInList with same attribute but different value overwrites previous update', () => {
      const builder = new UpdateCommandBuilder<Record<string, string[]>>(
        mockTableName,
        mockEntityKeys
      );

      const attribute1Name = 'ATTRIBUTE1';
      const attribute2Name = 'ATTRIBUTE2';

      const attribute1Value = ['VALUE1'];
      const attribute1Value2 = ['VALUE2'];
      const attribute2Value = ['VALUE3'];

      const res = builder
        .setValueInList(attribute1Name, attribute1Value)
        .setValueInList(attribute2Name, attribute2Value)
        .setValueInList(attribute1Name, attribute1Value2)
        .finalise();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: mockEntityKeys,
        ExpressionAttributeValues: {
          [`:${attribute1Name}`]: attribute1Value2,
          [`:${attribute2Name}`]: attribute2Value,
        },
        ExpressionAttributeNames: {
          [`#${attribute1Name}`]: attribute1Name,
          [`#${attribute2Name}`]: attribute2Name,
        },
        UpdateExpression: `SET #${attribute1Name} = list_append(#${attribute1Name}, :${attribute1Name}), #${attribute2Name} = list_append(#${attribute2Name}, :${attribute2Name})`,
      });
    });
  });

  describe('setValueInOrCreateList', () => {
    test('Appends to a list if it exists, otherwise creates the list', () => {
      const builder = new UpdateCommandBuilder<Record<string, string[]>>(
        mockTableName,
        mockEntityKeys
      );

      const attributeName = 'ATTRIBUTE';
      const value = ['VALUE'];

      const res = builder
        .setValueInOrCreateList(attributeName, value)
        .finalise();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: mockEntityKeys,
        ExpressionAttributeValues: {
          [`:${attributeName}`]: value,
          ':emptyList': [],
        },
        ExpressionAttributeNames: {
          [`#${attributeName}`]: attributeName,
        },
        UpdateExpression: `SET #${attributeName} = list_append(if_not_exists(#${attributeName}, :emptyList), :${attributeName})`,
      });
    });
  });

  describe('removeAttribute', () => {
    test('fields are correctly populated when performing single remove', () => {
      const builder = new UpdateCommandBuilder<Record<string, string[]>>(
        mockTableName,
        mockEntityKeys
      );

      const attributeName = 'ATTRIBUTE';

      const res = builder.removeAttribute(attributeName).finalise();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: mockEntityKeys,
        ExpressionAttributeNames: {
          [`#${attributeName}`]: attributeName,
        },
        UpdateExpression: `REMOVE #${attributeName}`,
      });
    });

    test('can remove multiple attributes', () => {
      const builder = new UpdateCommandBuilder<Record<string, string[]>>(
        mockTableName,
        mockEntityKeys
      );

      const attribute1Name = 'ATTRIBUTE1';
      const attribute2Name = 'ATTRIBUTE2';

      const res = builder
        .removeAttribute(attribute1Name)
        .removeAttribute(attribute2Name)
        .finalise();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: mockEntityKeys,
        ExpressionAttributeNames: {
          [`#${attribute1Name}`]: attribute1Name,
          [`#${attribute2Name}`]: attribute2Name,
        },
        UpdateExpression: `REMOVE #${attribute1Name}, #${attribute2Name}`,
      });
    });

    test('chaining removeAttribute with same attribute is idempotent', () => {
      const builder = new UpdateCommandBuilder<Record<string, string[]>>(
        mockTableName,
        mockEntityKeys
      );

      const attribute1Name = 'ATTRIBUTE1';
      const attribute2Name = 'ATTRIBUTE2';

      const res = builder
        .removeAttribute(attribute1Name)
        .removeAttribute(attribute2Name)
        .removeAttribute(attribute1Name)
        .finalise();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: mockEntityKeys,
        ExpressionAttributeNames: {
          [`#${attribute1Name}`]: attribute1Name,
          [`#${attribute2Name}`]: attribute2Name,
        },
        UpdateExpression: `REMOVE #${attribute1Name}, #${attribute2Name}`,
      });
    });
  });

  describe('addToValue', () => {
    test('fields are correctly to indicate an attibute is being incremented by value', () => {
      const builder = new UpdateCommandBuilder<Record<string, number>>(
        mockTableName,
        mockEntityKeys
      );

      const attributeName = 'ATTRIBUTE';

      const res = builder.addToValue(attributeName, 1).finalise();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: mockEntityKeys,
        ExpressionAttributeValues: {
          ':ATTRIBUTE_value': 1,
        },
        ExpressionAttributeNames: {
          [`#${attributeName}`]: attributeName,
        },
        UpdateExpression: `ADD #${attributeName} :${attributeName}_value`,
      });
    });
  });

  describe('finalise', () => {
    test('returns empty expression when built after initialisation', () => {
      const builder = new UpdateCommandBuilder<Record<string, string>>(
        mockTableName,
        mockEntityKeys
      );
      const res = builder.finalise();

      expect(res).toEqual({
        TableName: mockTableName,
        Key: mockEntityKeys,
        ExpressionAttributeNames: {},
        UpdateExpression: '',
      });
    });

    test('provide ReturnValuesOnConditionCheckFailure optional arg will modify output', () => {
      const builder = new UpdateCommandBuilder(mockTableName, mockEntityKeys, {
        ReturnValuesOnConditionCheckFailure: 'ALL_OLD',
      });

      const res = builder.finalise();

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
