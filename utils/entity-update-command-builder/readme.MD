# Entity Update Command Builder

This library serves as a tool for creating UpdateCommand inputs (used by the AWS DynamoDB SDK) for common entities stored in DynamoDB on the Communications Manager project.

## Package layout

```bash
src/
├── common/
│   ├── ConditionBuilder.ts
│   └── UpdateCommandBuilder.ts
├── domain/
│   └── EntityUpdateBuilder.ts
└── TemplateUpdateBuilder.ts
```

## Base Classes

- `ConditionBuilder<Entity>` - Class for building ConditionModel[] objects which are utilised by the `UpdateCommandBuilder<Entity>` for creating the UpdateCommand's ConditionExpression.
  - `and` - Appends a condition with an AND operator
  - `or` - Appends a condition with an OR operator
  - `andIn` - Appends a IN condition with an AND operator
  - `orIn` - Appends a IN condition with an OR operator
  - `andFn` - Appends a function condition with an AND operator
  - `orFn` - Appends a function condition with an OR operator
  - `andGroup` - Appends a group of conditions wrapped in parentheses, joined with an AND operator
  - `orGroup` - Appends a group of conditions wrapped in parentheses, joined with an OR operator
  - `build` - Returns an object with type ConditionModel[] with conditions specified by previous calls to the available condition methods.

- `UpdateCommandBuilder<Entity>` - Class that orchestrates the building of an UpdateCommand
  - `setValue` - Sets an attribute's value
  - `setValueInList` - Appends value/s to a list attribute. The List must already exist.
  - `setValueInOrCreateList` - Appends value/s to a list attribute. Creates a list if it doesn't already exist.
  - `removeAttribute` - Removes an attribute from an entity
  - `conditions` - Exposes a `ConditionBuilder` to manage the condition statement for the update
  - `build` - Returns an UpdateCommand object with conditions and CRUD operations specified by previous calls to the available class methods.

- `EntityUpdateBuilder<Entity>` - Parent class that Entity builder classes (e.g. RequestItemPlanUpdateBuilder) should extend from.
  - `build` - Calls the `build` method on the class instance's `UpdateCommandBuilder<Entity>` instance.

- `EntityUpdateBuilder<Entity>` - The `UpdateCommandBuilder` methods are public, so they can be unit tested. This class is simply a wrapper for `UpdateCommandBuilder` where the internal builder instance is protected, so its methods aren't exposed in the final domain builders.

The above classes are generic classes which take in a type parameter of `Entity` for the entity you are wanting to perform CRUD operations against. This gives the available CRUD methods type safety using the entity's type definition.

## Using the package

There are currently entity UpdateCommand builders for Templates and Routing Configs. Each have a set of available methods for performing CRUD operations against certain attributes on the entity.

If their current functionality was to be extended or a new entity UpdateCommand builder was to be made, the following CRUD operations on the class instance's `UpdateCommandBuilder<Entity>` instance are available.

- `this.updateBuilder.setValue` - Sets an attribute's value
- `this.updateBuilder.setValueIfNotExists` - Sets the value of an attribute only if the attribute does not currently exist
- `this.updateBuilder.setValueInList` - Appends value/s to a list attribute
- `this.updateBuilder.setValueInMap` - Sets values in a map attribute
- `this.updateBuilder.setValueInOrCreateList` - Appends value/s to a list attribute, creating the list if it doesn't exist
- `this.updateBuilder.removeAttribute` - Removes an attribute from an entity
- `this.updateBuilder.addToValue` - Increment a numeric attribute by the given value

### Writing conditions

In order to begin writing a condition, use either an .andCondition or .orCondition on an instance of an EntityUpdateBuilder derived class. The 2 below examples produce the same output as follows:

```javascript
this.updateBuilder.conditions
  .and('status', '=', 'CREATED')
  .orGroup((group) => {
    group.and('status', '=', 'SENDING').and('type', '=', 'LETTER')
  });
```

```javascript
{
    ConditionExpression: '#status = :condition_1_status OR (#status = :condition_2_1_status AND #type = :condition_2_2_type)'
    ExpressionAttributeNames: {
        '#status': 'status'
        '#type': 'type'
    }
    ExpressionAttributeValues: {
        ':condition_1_status': 'CREATED',
        ':condition_2_1_status': 'SENDING'
        ':condition_2_2_type': 'LETTER'
    }
    ...
}
```
