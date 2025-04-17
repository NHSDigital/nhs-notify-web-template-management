import { ConditionBuilder } from '../../common/condition-builder';
import { ConditionJoiner, ConditionModel } from '../../types/builders';

describe('ConditionBuilder', () => {
  describe('and', () => {
    test('will not add condition joiner to start of condition expression on first method call', () => {
      const attribute = 'ATTRIBUTE';
      const value = 'VALUE';
      const operator = '>';

      const condition = new ConditionBuilder<Record<string, string>>()
        .and(attribute, value, operator)
        .build();

      expect(condition).toEqual([
        {
          attribute,
          value,
          operator,
          negated: false,
        },
      ] satisfies ConditionModel[]);
    });

    const chainTestCases: ConditionJoiner[] = ['AND', 'OR'];

    test.each(chainTestCases)(
      'adds correct joiner when chained with %s method',
      (conditionJoiner) => {
        const attribute1 = 'ATTRIBUTE1';
        const value1 = 'VALUE1';
        const operator1 = '>';

        const attribute2 = 'ATTRIBUTE2';
        const value2 = 'VALUE2';
        const operator2 = '=';

        const conditionBuilder = new ConditionBuilder<
          Record<string, string>
        >().and(attribute1, value1, operator1, true);

        switch (conditionJoiner) {
          case 'AND': {
            conditionBuilder.and(attribute2, value2, operator2);
            break;
          }
          case 'OR': {
            conditionBuilder.or(attribute2, value2, operator2);
            break;
          }
          default: {
            throw new Error('Unexpected case');
          }
        }
        const condition = conditionBuilder.build();

        expect(condition).toEqual([
          {
            attribute: attribute1,
            value: value1,
            operator: operator1,
            negated: true,
          },
          {
            attribute: attribute2,
            value: value2,
            operator: operator2,
            conditionJoiner,
            negated: false,
          },
        ] satisfies ConditionModel[]);
        expect(condition.length).toEqual(2);
      }
    );
  });

  describe('or', () => {
    test('will not add condition joiner to start of condition expression on first method call', () => {
      const attribute = 'ATTRIBUTE';
      const value = 'VALUE';
      const operand = '>';

      const condition = new ConditionBuilder<Record<string, string>>()
        .or(attribute, value, operand)
        .build();

      expect(condition).toEqual([
        {
          attribute,
          value,
          operator: operand,
          negated: false,
        },
      ] satisfies ConditionModel[]);
    });

    const chainTestCases: ConditionJoiner[] = ['AND', 'OR'];

    test.each(chainTestCases)(
      'adds correct joiner when chained with %s method',
      (joiner) => {
        const attribute1 = 'ATTRIBUTE1';
        const value1 = 'VALUE1';
        const operator1 = '>';

        const attribute2 = 'ATTRIBUTE2';
        const value2 = 'VALUE2';
        const operator2 = '=';

        const conditionBuilder = new ConditionBuilder<
          Record<string, string>
        >().or(attribute1, value1, operator1, true);

        switch (joiner) {
          case 'AND': {
            conditionBuilder.and(attribute2, value2, operator2);
            break;
          }
          case 'OR': {
            conditionBuilder.or(attribute2, value2, operator2);
            break;
          }
          default: {
            throw new Error('Unexpected case');
          }
        }

        const condition = conditionBuilder.build();

        expect(condition).toEqual([
          {
            attribute: attribute1,
            value: value1,
            operator: operator1,
            negated: true,
          },
          {
            attribute: attribute2,
            value: value2,
            operator: operator2,
            conditionJoiner: joiner,
            negated: false,
          },
        ] satisfies ConditionModel[]);
        expect(condition.length).toEqual(2);
      }
    );
  });

  describe('fn', () => {
    test('will not add condition joiner to start of condition expression on first method call', () => {
      const attribute = 'ATTRIBUTE';
      const secondArgument = 'VALUE';
      const func = 'begins_with';

      const condition = new ConditionBuilder<Record<string, string>>()
        .fn(attribute, func, secondArgument)
        .build();

      expect(condition).toEqual([
        {
          attribute,
          secondArgument,
          fnOperator: func,
          negated: false,
        },
      ] satisfies ConditionModel[]);
    });

    const chainTestCases: ConditionJoiner[] = ['AND', 'OR'];

    test.each(chainTestCases)(
      'adds correct joiner when chained with %s method',
      (joiner) => {
        const attribute1 = 'ATTRIBUTE1';
        const secondArg1 = undefined;
        const operator1 = 'attribute_exists';

        const attribute2 = 'ATTRIBUTE2';
        const value2 = 'VALUE2';
        const operator2 = '=';

        const conditionBuilder = new ConditionBuilder<
          Record<string, string>
        >().fn(attribute1, operator1, secondArg1, true);

        switch (joiner) {
          case 'AND': {
            conditionBuilder.and(attribute2, value2, operator2);
            break;
          }
          case 'OR': {
            conditionBuilder.or(attribute2, value2, operator2);
            break;
          }
          default: {
            throw new Error('Unexpected case');
          }
        }

        const condition = conditionBuilder.build();

        expect(condition).toEqual([
          {
            attribute: attribute1,
            secondArgument: secondArg1,
            fnOperator: operator1,
            negated: true,
          },
          {
            attribute: attribute2,
            value: value2,
            operator: operator2,
            conditionJoiner: joiner,
            negated: false,
          },
        ] satisfies ConditionModel[]);
        expect(condition.length).toEqual(2);
      }
    );
  });

  describe('in', () => {
    test('will not add condition joiner to start of condition expression on first method call', () => {
      const attribute = 'ATTRIBUTE';
      const value = 'VALUE';

      const condition = new ConditionBuilder<Record<string, string>>()
        .in(attribute, value, true)
        .build();

      expect(condition).toEqual([
        {
          attribute,
          value,
          specialOperator: 'IN',
          negated: true,
        },
      ] satisfies ConditionModel[]);
    });

    test('will not add condition joiner specified in method call if a condition has not already been specified', () => {
      const attribute = 'ATTRIBUTE';
      const value = 'VALUE';

      const condition = new ConditionBuilder<Record<string, string>>()
        .in(attribute, value, false, 'OR')
        .build();

      expect(condition).toEqual([
        {
          attribute,
          value,
          specialOperator: 'IN',
          negated: false,
        },
      ] satisfies ConditionModel[]);
    });

    test('will add AND condition if called without joiner parameter and after a condition has already been specified', () => {
      const attribute = 'ATTRIBUTE';
      const value = 'VALUE';

      const condition = new ConditionBuilder<Record<string, string>>()
        .and(attribute, value, '<')
        .in(attribute, value)
        .build();

      expect(condition).toEqual([
        {
          attribute,
          value,
          operator: '<',
          negated: false,
        },
        {
          attribute,
          value,
          specialOperator: 'IN',
          conditionJoiner: 'AND',
          negated: false,
        },
      ] satisfies ConditionModel[]);
    });

    test('will add condition joiner specified in method call if a condition has already been specified', () => {
      const attribute = 'ATTRIBUTE';
      const value = 'VALUE';

      const condition = new ConditionBuilder<Record<string, string>>()
        .and(attribute, value, '<')
        .in(attribute, value, false, 'OR')
        .build();

      expect(condition).toEqual([
        {
          attribute,
          value,
          operator: '<',
          negated: false,
        },
        {
          attribute,
          value,
          specialOperator: 'IN',
          conditionJoiner: 'OR',
          negated: false,
        },
      ] satisfies ConditionModel[]);
    });
  });
  describe('build', () => {
    test('returns empty array when condition methods have not been called on class instance', () => {
      const condition = new ConditionBuilder().build();

      expect(condition.length).toEqual(0);
      expect(condition).toEqual([]);
    });
  });
});
