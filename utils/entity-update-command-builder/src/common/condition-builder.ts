import { Prop, PropType } from '../types/generics';
import {
  ConditionFnOperator,
  ConditionGroup,
  ConditionJoiner,
  ConditionModel,
  ConditionOperator,
  ConditionSpecialOperator,
  FnCondition,
  RegularCondition,
  SpecialCondition,
} from '../types/builders';

export class ConditionBuilder<Entity> {
  private readonly conditions: ConditionModel[] = [];

  and<T extends Prop<Entity>, K extends PropType<Entity, T>>(
    attribute: T,
    operator: ConditionOperator,
    value: K,
    negate?: boolean
  ) {
    this.addRegularCondition(attribute, operator, value, negate, 'AND');
    return this;
  }

  or<T extends Prop<Entity>, K extends PropType<Entity, T>>(
    attribute: T,
    operator: ConditionOperator,
    value: K,
    negate?: boolean
  ) {
    this.addRegularCondition(attribute, operator, value, negate, 'OR');
    return this;
  }

  andFn<T extends Prop<Entity>>(
    operator: ConditionFnOperator,
    attribute: T,
    value?: string,
    negate?: boolean
  ) {
    this.addFnCondition(operator, attribute, value, negate, 'AND');
    return this;
  }

  orFn<T extends Prop<Entity>>(
    operator: ConditionFnOperator,
    attribute: T,
    value?: string,
    negate?: boolean
  ) {
    this.addFnCondition(operator, attribute, value, negate, 'OR');
    return this;
  }

  andIn<T extends Prop<Entity>, K extends PropType<Entity, T>>(
    attribute: T,
    value: K | K[],
    negate?: boolean
  ) {
    this.addSpecialCondition(attribute, value, 'IN', negate, 'AND');
    return this;
  }

  orIn<T extends Prop<Entity>, K extends PropType<Entity, T>>(
    attribute: T,
    value: K | K[],
    negate?: boolean
  ) {
    this.addSpecialCondition(attribute, value, 'IN', negate, 'OR');
    return this;
  }

  andGroup(callback: (group: ConditionBuilder<Entity>) => void) {
    const group = new ConditionBuilder<Entity>();

    callback(group);

    this.addConditionGroup(group, 'AND');

    return this;
  }

  orGroup(callback: (group: ConditionBuilder<Entity>) => void) {
    const group = new ConditionBuilder<Entity>();

    callback(group);

    this.addConditionGroup(group, 'OR');

    return this;
  }

  private isEmpty() {
    return this.conditions.length === 0;
  }

  private addRegularCondition<
    T extends Prop<Entity>,
    K extends PropType<Entity, T>,
  >(
    attribute: T,
    operator: ConditionOperator,
    value: K,
    negated = false,
    conditionJoiner?: ConditionJoiner
  ) {
    const condition: RegularCondition = {
      attribute,
      value,
      operator,
      negated,
      conditionJoiner,
    };

    this.addCondition(condition);
  }

  private addFnCondition<T extends Prop<Entity>>(
    fnOperator: ConditionFnOperator,
    attribute: T,
    value?: string,
    negated = false,
    conditionJoiner?: ConditionJoiner
  ) {
    const condition: FnCondition = {
      fnOperator,
      attribute,
      value,
      negated,
      conditionJoiner,
    };

    this.addCondition(condition);
  }

  private addSpecialCondition<
    T extends Prop<Entity>,
    K extends PropType<Entity, T>,
  >(
    attribute: T,
    value: K | K[],
    specialOperator: ConditionSpecialOperator,
    negated = false,
    conditionJoiner?: ConditionJoiner
  ) {
    const condition: SpecialCondition = {
      attribute,
      value,
      specialOperator,
      conditionJoiner,
      negated,
    };

    this.addCondition(condition);
  }

  private addConditionGroup(
    group: ConditionBuilder<Entity>,
    conditionJoiner: ConditionJoiner
  ) {
    const condition: ConditionGroup = {
      conditions: group.build(),
      conditionJoiner,
    };

    this.addCondition(condition);
  }

  private addCondition(condition: ConditionModel) {
    if (this.isEmpty()) {
      condition.conditionJoiner = undefined;
    }

    this.conditions.push(condition);
  }

  build() {
    return this.conditions;
  }
}
