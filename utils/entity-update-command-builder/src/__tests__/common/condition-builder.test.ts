import { ConditionBuilder } from '../../common/condition-builder';
import { ConditionModel } from '../../types/builders';

describe('ConditionBuilder', () => {
  describe('and', () => {
    test('will not add condition joiner to start of condition expression on first method call', () => {
      const condition = new ConditionBuilder<Record<string, string>>()
        .and('ATTRIBUTE', '>', 'VALUE', true)
        .build();

      expect(condition).toEqual([
        {
          attribute: 'ATTRIBUTE',
          value: 'VALUE',
          operator: '>',
          negated: true,
        },
      ] satisfies ConditionModel[]);
    });

    test('adds AND joiner when chained', () => {
      const conditionBuilder = new ConditionBuilder<Record<string, string>>()
        .and('ATTRIBUTE1', '>', 'VALUE1')
        .and('ATTRIBUTE2', '=', 'VALUE2');

      const condition = conditionBuilder.build();

      expect(condition).toEqual([
        {
          attribute: 'ATTRIBUTE1',
          value: 'VALUE1',
          operator: '>',
          negated: false,
        },
        {
          attribute: 'ATTRIBUTE2',
          value: 'VALUE2',
          operator: '=',
          conditionJoiner: 'AND',
          negated: false,
        },
      ] satisfies ConditionModel[]);
      expect(condition.length).toEqual(2);
    });
  });

  describe('or', () => {
    test('will not add condition joiner to start of condition expression on first method call', () => {
      const condition = new ConditionBuilder<Record<string, string>>()
        .or('ATTRIBUTE', '>', 'VALUE', true)
        .build();

      expect(condition).toEqual([
        {
          attribute: 'ATTRIBUTE',
          value: 'VALUE',
          operator: '>',
          negated: true,
        },
      ] satisfies ConditionModel[]);
    });

    test('adds OR joiner when chained', () => {
      const conditionBuilder = new ConditionBuilder<Record<string, string>>()
        .or('ATTRIBUTE1', '>', 'VALUE1')
        .or('ATTRIBUTE2', '=', 'VALUE2');

      const condition = conditionBuilder.build();

      expect(condition).toEqual([
        {
          attribute: 'ATTRIBUTE1',
          value: 'VALUE1',
          operator: '>',
          negated: false,
        },
        {
          attribute: 'ATTRIBUTE2',
          value: 'VALUE2',
          operator: '=',
          conditionJoiner: 'OR',
          negated: false,
        },
      ] satisfies ConditionModel[]);
      expect(condition.length).toEqual(2);
    });
  });

  describe('andFn', () => {
    test('will not add condition joiner to start of condition expression on first method call', () => {
      const condition = new ConditionBuilder<Record<string, string>>()
        .andFn('begins_with', 'ATTRIBUTE', 'VALUE', true)
        .build();

      expect(condition).toEqual([
        {
          attribute: 'ATTRIBUTE',
          value: 'VALUE',
          fnOperator: 'begins_with',
          negated: true,
        },
      ] satisfies ConditionModel[]);
    });

    test('adds AND joiner when chained', () => {
      const conditionBuilder = new ConditionBuilder<Record<string, string>>()
        .andFn('attribute_exists', 'ATTRIBUTE1')
        .andFn('attribute_not_exists', 'ATTRIBUTE2');

      const condition = conditionBuilder.build();

      expect(condition).toEqual([
        {
          attribute: 'ATTRIBUTE1',
          value: undefined,
          fnOperator: 'attribute_exists',
          negated: false,
        },
        {
          attribute: 'ATTRIBUTE2',
          value: undefined,
          fnOperator: 'attribute_not_exists',
          conditionJoiner: 'AND',
          negated: false,
        },
      ] satisfies ConditionModel[]);
      expect(condition.length).toEqual(2);
    });
  });

  describe('orFn', () => {
    test('will not add condition joiner to start of condition expression on first method call', () => {
      const condition = new ConditionBuilder<Record<string, string>>()
        .orFn('begins_with', 'ATTRIBUTE', 'VALUE', true)
        .build();

      expect(condition).toEqual([
        {
          attribute: 'ATTRIBUTE',
          value: 'VALUE',
          fnOperator: 'begins_with',
          negated: true,
        },
      ] satisfies ConditionModel[]);
    });

    test('adds OR joiner when chained', () => {
      const conditionBuilder = new ConditionBuilder<Record<string, string>>()
        .orFn('attribute_exists', 'ATTRIBUTE1')
        .orFn('attribute_not_exists', 'ATTRIBUTE2');

      const condition = conditionBuilder.build();

      expect(condition).toEqual([
        {
          attribute: 'ATTRIBUTE1',
          value: undefined,
          fnOperator: 'attribute_exists',
          negated: false,
        },
        {
          attribute: 'ATTRIBUTE2',
          value: undefined,
          fnOperator: 'attribute_not_exists',
          conditionJoiner: 'OR',
          negated: false,
        },
      ] satisfies ConditionModel[]);
      expect(condition.length).toEqual(2);
    });
  });

  describe('andIn', () => {
    test('will not add condition joiner to start of condition expression on first method call', () => {
      const condition = new ConditionBuilder<Record<string, string>>()
        .andIn('ATTRIBUTE', 'VALUE', true)
        .build();

      expect(condition).toEqual([
        {
          attribute: 'ATTRIBUTE',
          value: 'VALUE',
          specialOperator: 'IN',
          negated: true,
        },
      ] satisfies ConditionModel[]);
    });

    test('adds AND joiner when chained', () => {
      const conditionBuilder = new ConditionBuilder<Record<string, string>>()
        .andIn('ATTRIBUTE1', 'VALUE1')
        .andIn('ATTRIBUTE2', 'VALUE2');

      const condition = conditionBuilder.build();

      expect(condition).toEqual([
        {
          attribute: 'ATTRIBUTE1',
          value: 'VALUE1',
          specialOperator: 'IN',
          negated: false,
        },
        {
          attribute: 'ATTRIBUTE2',
          value: 'VALUE2',
          specialOperator: 'IN',
          negated: false,
          conditionJoiner: 'AND',
        },
      ] satisfies ConditionModel[]);
      expect(condition.length).toEqual(2);
    });
  });

  describe('orIn', () => {
    test('will not add condition joiner to start of condition expression on first method call', () => {
      const condition = new ConditionBuilder<Record<string, string>>()
        .orIn('ATTRIBUTE', 'VALUE', true)
        .build();

      expect(condition).toEqual([
        {
          attribute: 'ATTRIBUTE',
          value: 'VALUE',
          specialOperator: 'IN',
          negated: true,
        },
      ] satisfies ConditionModel[]);
    });

    test('adds OR joiner when chained', () => {
      const conditionBuilder = new ConditionBuilder<Record<string, string>>()
        .orIn('ATTRIBUTE1', 'VALUE1')
        .orIn('ATTRIBUTE2', 'VALUE2');

      const condition = conditionBuilder.build();

      expect(condition).toEqual([
        {
          attribute: 'ATTRIBUTE1',
          value: 'VALUE1',
          specialOperator: 'IN',
          negated: false,
        },
        {
          attribute: 'ATTRIBUTE2',
          value: 'VALUE2',
          specialOperator: 'IN',
          negated: false,
          conditionJoiner: 'OR',
        },
      ] satisfies ConditionModel[]);
      expect(condition.length).toEqual(2);
    });
  });

  describe('andGroup', () => {
    test('will add group to conditions with no joiner on first method call', () => {
      const builder = new ConditionBuilder<Record<string, string>>();

      builder.andGroup((group) => {
        group.and('bar', '=', '2').or('bar', '=', '3');
      });

      expect(builder.build()).toEqual([
        {
          conditions: [
            {
              attribute: 'bar',
              negated: false,
              operator: '=',
              value: '2',
            },
            {
              attribute: 'bar',
              conditionJoiner: 'OR',
              negated: false,
              operator: '=',
              value: '3',
            },
          ],
        },
      ]);
    });

    test('will add group to conditions with AND joiner when chained', () => {
      const builder = new ConditionBuilder<Record<string, string>>();

      builder.and('foo', '=', '1').andGroup((group) => {
        group.and('bar', '=', '2').or('bar', '=', '3');
      });

      expect(builder.build()).toEqual([
        {
          attribute: 'foo',
          negated: false,
          operator: '=',
          value: '1',
        },
        {
          conditionJoiner: 'AND',
          conditions: [
            {
              attribute: 'bar',
              negated: false,
              operator: '=',
              value: '2',
            },
            {
              attribute: 'bar',
              conditionJoiner: 'OR',
              negated: false,
              operator: '=',
              value: '3',
            },
          ],
        },
      ]);
    });
  });

  describe('orGroup', () => {
    test('will add group to conditions with no joiner on first method call', () => {
      const builder = new ConditionBuilder<Record<string, string>>();

      builder.orGroup((group) => {
        group.and('bar', '=', '2').and('bar', '=', '3');
      });

      expect(builder.build()).toEqual([
        {
          conditions: [
            {
              attribute: 'bar',
              negated: false,
              operator: '=',
              value: '2',
            },
            {
              attribute: 'bar',
              conditionJoiner: 'AND',
              negated: false,
              operator: '=',
              value: '3',
            },
          ],
        },
      ]);
    });

    test('will add group to conditions with OR joiner', () => {
      const builder = new ConditionBuilder<Record<string, string>>();

      builder.and('foo', '=', '1').orGroup((group) => {
        group.and('bar', '=', '2').and('baz', '=', '3');
      });

      expect(builder.build()).toEqual([
        {
          attribute: 'foo',
          negated: false,
          operator: '=',
          value: '1',
        },
        {
          conditionJoiner: 'OR',
          conditions: [
            {
              attribute: 'bar',
              negated: false,
              operator: '=',
              value: '2',
            },
            {
              attribute: 'baz',
              conditionJoiner: 'AND',
              negated: false,
              operator: '=',
              value: '3',
            },
          ],
        },
      ]);
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
