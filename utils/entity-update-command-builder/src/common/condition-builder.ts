import { Prop, PropType } from '../types/generics';
import {
  ConditionFnOperator,
  ConditionJoiner,
  ConditionModel,
  ConditionOperator,
  ConditionSpecialOperator,
} from '../types/builders';

export class ConditionBuilder<Entity> {
  private readonly conditions: ConditionModel[] = [];

  or<T extends Prop<Entity>, K extends PropType<Entity, T>>(
    attribute: T,
    value: K,
    operator: ConditionOperator,
    negate?: boolean
  ) {
    if (this.isEmpty()) {
      this.addCondition(attribute, value, operator, negate);
      return this;
    }
    this.addCondition(attribute, value, operator, negate, 'OR');
    return this;
  }

  and<T extends Prop<Entity>, K extends PropType<Entity, T>>(
    attribute: T,
    value: K,
    operator: ConditionOperator,
    negate?: boolean
  ) {
    if (this.isEmpty()) {
      this.addCondition(attribute, value, operator, negate);
      return this;
    }
    this.addCondition(attribute, value, operator, negate, 'AND');
    return this;
  }

  fn<T extends Prop<Entity>>(
    attribute: T,
    secondArgument: string | null,
    operator: ConditionFnOperator,
    negate?: boolean,
    conditionJoiner?: ConditionJoiner
  ) {
    if (this.isEmpty()) {
      this.addFnCondition(attribute, secondArgument, operator, negate);
      return this;
    }
    this.addFnCondition(
      attribute,
      secondArgument,
      operator,
      negate,
      conditionJoiner ?? 'AND'
    );
    return this;
  }

  in<T extends Prop<Entity>, K extends PropType<Entity, T>>(
    attribute: T,
    value: K | K[],
    negate?: boolean,
    conditionJoiner?: ConditionJoiner
  ) {
    if (this.isEmpty()) {
      this.addSpecialCondition(attribute, value, 'IN', negate);
      return this;
    }
    this.addSpecialCondition(
      attribute,
      value,
      'IN',
      negate,
      conditionJoiner ?? 'AND'
    );
    return this;
  }

  private isEmpty() {
    return this.conditions.length === 0;
  }

  private addSpecialCondition<
    T extends Prop<Entity>,
    K extends PropType<Entity, T>,
  >(
    attribute: T,
    value: K | K[],
    specialOperator: ConditionSpecialOperator,
    negate?: boolean,
    conditionJoiner?: ConditionJoiner
  ) {
    this.conditions.push({
      attribute,
      value,
      specialOperator,
      conditionJoiner,
      negated: negate || false,
    });
  }

  private addFnCondition<T extends Prop<Entity>>(
    attribute: T,
    secondArgument: string | null,
    fnOperator: ConditionFnOperator,
    negate?: boolean,
    conditionJoiner?: ConditionJoiner
  ) {
    this.conditions.push({
      attribute,
      secondArgument,
      fnOperator,
      conditionJoiner,
      negated: negate || false,
    });
  }

  private addCondition<T extends Prop<Entity>, K extends PropType<Entity, T>>(
    attribute: T,
    value: K,
    operator: ConditionOperator,
    negate?: boolean,
    conditionJoiner?: ConditionJoiner
  ) {
    this.conditions.push({
      attribute,
      value,
      operator,
      conditionJoiner,
      negated: negate || false,
    });
  }

  build() {
    return this.conditions;
  }
}
