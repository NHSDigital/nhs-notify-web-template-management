export type UpdateExpressionSet = Record<
  'SET' | 'REMOVE' | 'ADD' | 'DELETE',
  Record<string, unknown>
>;

export type ConditionOperator = '<' | '>' | '=' | '<>' | '>=' | '<=';

export type ConditionFnOperator =
  | 'attribute_not_exists'
  | 'attribute_exists'
  | 'attribute_type'
  | 'begins_with'
  | 'contains';

export type ConditionSpecialOperator = 'IN';

export type ConditionJoiner = 'AND' | 'OR';

export type BuilderOptionalArgs = {
  ReturnValuesOnConditionCheckFailure?: 'ALL_OLD';
  ReturnValues?: 'ALL_NEW';
};

type BaseConditionAttributes = {
  attribute: string;
  negated: boolean;
  conditionJoiner?: ConditionJoiner;
};

export type RegularCondition = BaseConditionAttributes & {
  operator: ConditionOperator;
  value: unknown;
};

export type FnCondition = BaseConditionAttributes & {
  fnOperator: ConditionFnOperator;
  value: string | undefined;
};

export type SpecialCondition = BaseConditionAttributes & {
  specialOperator: ConditionSpecialOperator;
  value: unknown;
};

export type Condition = RegularCondition | SpecialCondition | FnCondition;

export type ConditionGroup = {
  conditions: ConditionModel[];
  conditionJoiner?: ConditionJoiner;
};

export type ConditionModel = Condition | ConditionGroup;
