import { Prop, PropType } from '../types/generics';
import {
  BuilderOptionalArgs,
  RegularCondition,
  SpecialCondition,
  UpdateExpressionSet,
  FnCondition,
  ConditionGroup,
} from '../types/builders';
import { ConditionBuilder } from './condition-builder';

export class UpdateCommandBuilder<Entity> {
  private _updateExpressionSet: UpdateExpressionSet = {
    SET: {},
    REMOVE: {},
    ADD: {},
    DELETE: {},
  };

  private _expressionAttributeValues: Record<string, unknown> = {};

  private _expressionAttributeNames: Record<string, string> = {};

  public readonly conditions = new ConditionBuilder<Entity>();

  constructor(
    private readonly _tableName: string,
    private readonly _keys: Record<string, string>,
    private readonly _optionalArgs: BuilderOptionalArgs = {}
  ) {}

  setValue<T extends Prop<Entity>, K extends PropType<Entity, T>>(
    attributeName: T,
    value: K
  ) {
    this._expressionAttributeNames[`#${attributeName}`] = attributeName;
    this._expressionAttributeValues[`:${attributeName}`] = value;
    this._updateExpressionSet.SET[attributeName] =
      `#${attributeName} = :${attributeName}`;
    return this;
  }

  setValueIfNotExists<T extends Prop<Entity>, K extends PropType<Entity, T>>(
    attributeName: T,
    value: K
  ) {
    this._expressionAttributeNames[`#${attributeName}`] = attributeName;
    this._expressionAttributeValues[`:${attributeName}`] = value;
    this._updateExpressionSet.SET[attributeName] =
      `#${attributeName} = if_not_exists(#${attributeName}, :${attributeName})`;
    return this;
  }

  addToValue<T extends Prop<Entity>, K extends PropType<Entity, T>>(
    attributeName: T,
    value: K
  ) {
    this._expressionAttributeNames[`#${attributeName}`] = attributeName;
    this._expressionAttributeValues[`:${attributeName}`] = value;
    this._updateExpressionSet.ADD[attributeName] =
      `#${attributeName} :${attributeName}`;
    return this;
  }

  removeAttribute<T extends Prop<Entity>>(attributeName: T) {
    this._expressionAttributeNames[`#${attributeName}`] = attributeName;
    this._updateExpressionSet.REMOVE[attributeName] = `#${attributeName}`;
    return this;
  }

  setValueInList<T extends Prop<Entity>, K extends PropType<Entity, T>>(
    attributeName: T,
    value: K
  ) {
    this._expressionAttributeNames[`#${attributeName}`] = attributeName;
    this._expressionAttributeValues[`:${attributeName}`] = value;
    this._updateExpressionSet.SET[attributeName] =
      `#${attributeName} = list_append(#${attributeName}, :${attributeName})`;
    return this;
  }

  setValueInMap<
    V,
    T extends Prop<Entity>,
    K extends Extract<Entity[T], Record<string, V>>[string],
  >(attributeName: T, mapKey: string, value: K) {
    this._expressionAttributeNames[`#${attributeName}`] = attributeName;
    this._expressionAttributeNames[`#${mapKey}`] = mapKey;
    this._expressionAttributeValues[`:${mapKey}`] = value;
    this._updateExpressionSet.SET[attributeName] =
      `#${attributeName}.#${mapKey} = :${mapKey}`;
    return this;
  }

  setValueInOrCreateList<T extends Prop<Entity>, K extends PropType<Entity, T>>(
    attributeName: T,
    value: K
  ) {
    this._expressionAttributeNames[`#${attributeName}`] = attributeName;
    this._expressionAttributeValues[`:${attributeName}`] = value;
    this._expressionAttributeValues[':emptyList'] = [];
    this._updateExpressionSet.SET[attributeName] =
      `#${attributeName} = list_append(if_not_exists(#${attributeName}, :emptyList), :${attributeName})`;
    return this;
  }

  private buildInCondition(
    condition: SpecialCondition,
    conditionIndex: number,
    depthPrefix: string
  ) {
    const { attribute, value, conditionJoiner, negated } = condition;

    const values = Array.isArray(value) ? value : [value];

    const attributeNameKey = `#${attribute}`;
    this._expressionAttributeNames[attributeNameKey] = attribute;

    const inValueKeys = [];

    let localIndex = 1;

    for (const conditionValue of values) {
      const conditionValueKey = `:condition_${[depthPrefix, conditionIndex, localIndex, attribute].filter(Boolean).join('_')}`;
      this._expressionAttributeValues[conditionValueKey] = conditionValue;
      inValueKeys.push(conditionValueKey);

      localIndex += 1;
    }

    const negation = negated ? 'NOT ' : '';
    const prefix = conditionJoiner
      ? `${conditionJoiner} ${negation}`
      : negation;

    return `${prefix}${attributeNameKey} IN (${inValueKeys.join(', ')})`;
  }

  private buildSpecialCondition(
    condition: SpecialCondition,
    conditionIndex: number,
    depthPrefix: string
  ) {
    return this.buildInCondition(condition, conditionIndex, depthPrefix);
  }

  private buildFnCondition(
    condition: FnCondition,
    conditionIndex: number,
    depthPrefix: string
  ) {
    const { attribute, value, conditionJoiner, fnOperator, negated } =
      condition;

    const attributeNameKey = `#${attribute}`;

    this._expressionAttributeNames[attributeNameKey] = attribute;

    const conditionArgKey = `:condition_${[depthPrefix, conditionIndex, attribute].filter(Boolean).join('_')}`;

    if (value) {
      this._expressionAttributeValues[conditionArgKey] = value;
    }

    const negation = negated ? 'NOT ' : '';
    const prefix = conditionJoiner
      ? `${conditionJoiner} ${negation}`
      : negation;

    const arg = value ? `, ${conditionArgKey}` : '';

    return `${prefix}${fnOperator} (${attributeNameKey}${arg})`;
  }

  private buildCondition(
    condition: RegularCondition,
    conditionIndex: number,
    depthPrefix: string
  ) {
    const { attribute, value, conditionJoiner, operator, negated } = condition;

    const conditionValueKey = `:condition_${[depthPrefix, conditionIndex, attribute].filter(Boolean).join('_')}`;
    const attributeNameKey = `#${attribute}`;

    this._expressionAttributeNames[attributeNameKey] = attribute;
    this._expressionAttributeValues[conditionValueKey] = value;

    const negation = negated ? 'NOT ' : '';
    const prefix = conditionJoiner
      ? `${conditionJoiner} ${negation}`
      : negation;

    return `${prefix}${attributeNameKey} ${operator} ${conditionValueKey}`;
  }

  private buildGroup(
    condition: ConditionGroup,
    conditionIndex: number,
    depthPrefix: string
  ): string {
    const expression = `(${this.buildConditionExpression(
      condition.conditions,
      depthPrefix ? `${depthPrefix}_${conditionIndex}` : `${conditionIndex}`
    )})`;

    return condition.conditionJoiner
      ? `${condition.conditionJoiner} ${expression}`
      : expression;
  }

  private buildConditionExpression(
    conditions = this.conditions.build(),
    depthPrefix = ''
  ): string {
    return conditions
      .map((condition, index) => {
        const conditionIndex = index + 1;

        if ('specialOperator' in condition) {
          return this.buildSpecialCondition(
            condition,
            conditionIndex,
            depthPrefix
          );
        }
        if ('fnOperator' in condition) {
          return this.buildFnCondition(condition, conditionIndex, depthPrefix);
        }
        if ('operator' in condition) {
          return this.buildCondition(condition, conditionIndex, depthPrefix);
        }
        if ('conditions' in condition) {
          return this.buildGroup(condition, conditionIndex, depthPrefix);
        }
        // unreachable
        /* istanbul ignore next */
        throw new Error('Unsupported condition provided');
      })
      .join(' ');
  }

  private buildUpdateExpression() {
    return Object.entries(this._updateExpressionSet)
      .flatMap(([action, clause]) =>
        Object.keys(clause).length > 0
          ? `${action} ${Object.values(clause).join(', ')}`
          : []
      )
      .join(' ');
  }

  finalise() {
    const conditionExpression = this.buildConditionExpression();
    const updateExpression = this.buildUpdateExpression();

    const expressionAttributeValuesPresent =
      Object.keys(this._expressionAttributeValues).length > 0;

    return {
      TableName: this._tableName,
      Key: this._keys,
      ExpressionAttributeNames: this._expressionAttributeNames,
      UpdateExpression: updateExpression,
      ...(expressionAttributeValuesPresent && {
        ExpressionAttributeValues: this._expressionAttributeValues,
      }),
      ...(conditionExpression.length > 0 && {
        ConditionExpression: conditionExpression,
      }),
      ...this._optionalArgs,
    };
  }
}
