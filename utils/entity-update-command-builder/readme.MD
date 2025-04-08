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
├── RequestItemPlanUpdateBuilder.ts
└── RequestItemUpdateBuilder.ts
```

## Base Classes

- `ConditionBuilder<Entity>` - Class for building ConditionModel[] objects which are utilised by the `UpdateCommandBuilder<Entity>` for creating the UpdateCommand's ConditionExpression
  - `or` - Appends a condition with an OR operator if no condition has been specified previously 
  - `and` - Appends a condition with an AND operator if no condition has been specified previously 
  - `in` - Appends a condition with operator provided or AND if not.
  - `build` - Returns an object with type ConditionModel[] with conditions specified by previous calls to the available condition methods.

- `UpdateCommandBuilder<Entity>` - Class that orchestrates the building of an UpdateCommand
  - `setValue` - Sets an attribute's value
  - `setValueInList` - Appends value/s to a list attribute. The List must already exist.
  - `setValueInOrCreateList` - Appends value/s to a list attribute. Creates a list if it doesn't already exist.
  - `removeAttribute` - Removes an attribute from an entity
  - `andCondition` - Calls the injected `ConditionBuilder`'s `and` method
  - `orCondition` - Calls the injected `ConditionBuilder`'s `or` method
  - `inCondition` - Calls the injected `ConditionBuilder`'s `in` method
  - `build` - Returns an UpdateCommand object with conditions and CRUD operations specified by previous calls to the available class methods.
- `EntityUpdateBuilder<Entity>` - Parent class that Entity builder classes (e.g. RequestItemPlanUpdateBuilder) should extend from.
  - `build` - Calls the `build` method on the class instance's `UpdateCommandBuilder<Entity>` instance.

The above classes are generic classes which take in a type parameter of `Entity` for the entity you are wanting to perform CRUD operations against. This gives the available CRUD methods type safety using the entity's type definition.

## Using the package

There are currently entity UpdateCommand builders for Request Items and Request Item Plans. Each have a set of available methods for performing CRUD operations against certain attributes on the entity.

If their current functionality was to be extended or a new entity UpdateCommand builder was to be made, the following CRUD operations on the class instance's `UpdateCommandBuilder<Entity>` instance are available.

- `this.updateBuilder.setValue` - Sets an attribute's value
- `this.updateBuilder.setValueInList` - Appends value/s to a list attribute
- `this.updateBuilder.removeAttribute` - Removes an attribute from an entity
- `this.updateBuilder.andCondition` - Appends a condition with an AND operator
- `this.updateBuilder.orCondition` - Appends a condition with an OR operator
- `this.updateBuilder.inCondition` - Appends a IN condition with join operator specified, or AND when not.

### Writing conditions

In order to begin writing a condition, use either an .andCondition or .orCondition on an instance of an EntityUpdateBuilder derived class. The 2 below examples produce the same output as follows:

```javascript
this.updateBuilder.andCondition('status', 'CREATED', '=');
    .orCondition('status', 'SENDING', '=');

this.updateBuilder.orCondition('status', 'CREATED', '=');
    .orCondition('status', 'SENDING', '=');
```

```javascript
{
    ConditionExpression: '#status = :condition_1_status OR #status = :condition_2_status'
    ExpressionAttributeNames: {
        '#status': 'status'
    }
    ExpressionAttributeValues: {
        ':condition_1_status': 'CREATED',
        ':condition_2_status': 'SENDING'
    }
    ...
}
```
