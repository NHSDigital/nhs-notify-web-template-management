import { Prop, PropType } from '../types/generics';
import {
  BuilderOptionalArgs,
  RegularCondition,
  ConditionJoiner,
  ConditionModel,
  ConditionOperator,
  SpecialCondition,
  UpdateExpressionSet,
  FnCondition,
  ConditionFnOperator,
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

  private _conditions: ConditionModel[] = [];

  private _conditionBuilder = new ConditionBuilder<Entity>();

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

  addToValue<T extends Prop<Entity>, K extends PropType<Entity, T>>(
    attributeName: T,
    value: K
  ) {
    this._expressionAttributeNames[`#${attributeName}`] = attributeName;
    this._expressionAttributeValues[`:${attributeName}_value`] = value;
    this._updateExpressionSet.ADD[attributeName] =
      `#${attributeName} :${attributeName}_value`;
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

  orCondition<T extends Prop<Entity>, K extends PropType<Entity, T>>(
    attribute: T,
    operand: ConditionOperator,
    value: K,
    negate?: boolean
  ) {
    this._conditionBuilder.or(attribute, value, operand, negate);
    return this;
  }

  andCondition<T extends Prop<Entity>, K extends PropType<Entity, T>>(
    attribute: T,
    operand: ConditionOperator,
    value: K,
    negate?: boolean
  ) {
    this._conditionBuilder.and(attribute, value, operand, negate);
    return this;
  }

  fnCondition<T extends Prop<Entity>>(
    operand: ConditionFnOperator,
    attribute: T,
    secondArgument?: string,
    negate?: boolean,
    conditionJoiner?: ConditionJoiner
  ) {
    this._conditionBuilder.fn(
      attribute,
      operand,
      secondArgument,
      negate,
      conditionJoiner
    );
    return this;
  }

  inCondition<T extends Prop<Entity>, K extends PropType<Entity, T>>(
    attribute: T,
    value: K | K[],
    negate?: boolean,
    conditionJoiner?: ConditionJoiner
  ) {
    this._conditionBuilder.in(attribute, value, negate, conditionJoiner);
    return this;
  }

  private buildInCondition(
    condition: SpecialCondition,
    conditionIndex: number
  ) {
    let localIndex = conditionIndex;

    const { attribute, value, conditionJoiner, negated } = condition;

    const values = Array.isArray(value) ? value : [value];

    const attributeNameKey = `#${attribute}`;
    this._expressionAttributeNames[attributeNameKey] = attribute;

    const inValueKeys = [];

    for (const conditionValue of values) {
      const conditionValueKey = `:condition_${localIndex}_${attribute}`;
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
    conditionIndex: number
  ) {
    return this.buildInCondition(condition, conditionIndex);
  }

  private buildFnCondition(condition: FnCondition, conditionIndex: number) {
    const { attribute, secondArgument, conditionJoiner, fnOperator, negated } =
      condition;

    const attributeNameKey = `#${attribute}`;

    this._expressionAttributeNames[attributeNameKey] = attribute;

    const conditionArgKey = `:condition_${conditionIndex}_${attribute}`;

    if (secondArgument) {
      this._expressionAttributeValues[conditionArgKey] = secondArgument;
    }

    const negation = negated ? 'NOT ' : '';
    const prefix = conditionJoiner
      ? `${conditionJoiner} ${negation}`
      : negation;

    const arg = secondArgument ? `, ${conditionArgKey}` : '';

    return `${prefix}${fnOperator} (${attributeNameKey}${arg})`;
  }

  private buildCondition(condition: RegularCondition, conditionIndex: number) {
    const { attribute, value, conditionJoiner, operator, negated } = condition;

    const conditionValueKey = `:condition_${conditionIndex}_${attribute}`;
    const attributeNameKey = `#${attribute}`;

    this._expressionAttributeNames[attributeNameKey] = attribute;
    this._expressionAttributeValues[conditionValueKey] = value;

    const negation = negated ? 'NOT ' : '';
    const prefix = conditionJoiner
      ? `${conditionJoiner} ${negation}`
      : negation;

    return `${prefix}${attributeNameKey} ${operator} ${conditionValueKey}`;
  }

  private buildConditionExpression() {
    this._conditions = this._conditionBuilder.build();

    return this._conditions
      .map((condition, index) => {
        const conditionIndex = index + 1;

        if ('specialOperator' in condition) {
          return this.buildSpecialCondition(condition, conditionIndex);
        }
        if ('fnOperator' in condition) {
          return this.buildFnCondition(condition, conditionIndex);
        }
        if ('operator' in condition) {
          return this.buildCondition(condition, conditionIndex);
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
      ...(this._conditions.length > 0 && {
        ConditionExpression: conditionExpression,
      }),
      ...this._optionalArgs,
    };
  }
}
