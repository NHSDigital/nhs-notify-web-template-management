# AGENTS.md - Lambdas
<!-- vale off -->

## Scope

This file provides guidance for AI agents working on Lambda functions in this repository. For general repository guidance, see the root `AGENTS.md`.

## Directory Structure

Each lambda project follows this structure:

```text
lambdas/{name}/
├── package.json          # Workspace package
├── jest.config.ts        # Jest configuration
├── tsconfig.json         # TypeScript configuration
├── build.sh              # Build script (if custom build needed)
└── src/
    ├── __tests__/        # Test files mirroring src structure
    │   ├── app/          # Client/business logic tests
    │   ├── infra/        # Repository tests
    │   └── fixtures/     # Test data factories
    ├── api/              # API request/response handling
    ├── app/              # Business logic clients
    ├── container/        # Dependency injection
    ├── domain/           # Domain types and schemas
    ├── infra/            # Data access (repositories)
    ├── utils/            # Shared utilities
    └── *.ts              # Lambda entry points
```

## Architecture Patterns

### Layered Architecture

The `backend-api` lambda follows a layered architecture:

1. **Entry Points** (`src/*.ts`) - Lambda handlers, minimal logic
2. **API Layer** (`src/api/`) - Request parsing, response formatting
3. **App Layer** (`src/app/`) - Business logic clients
4. **Infra Layer** (`src/infra/`) - Data access repositories

### Repository Pattern

Repositories handle all DynamoDB operations. Key patterns:

```typescript
// Repository methods return ApplicationResult<T>
async get(id: string, clientId: string): Promise<ApplicationResult<Entity>>
async create(input: CreateEntity, user: User): Promise<ApplicationResult<Entity>>
async update(id: string, data: UpdateEntity, user: User, lockNumber: number): Promise<ApplicationResult<Entity>>
async submit(id: string, user: User, lockNumber: number): Promise<ApplicationResult<Entity>>
async delete(id: string, user: User, lockNumber: number): Promise<ApplicationResult<Entity>>
```

### Result Type Pattern

All repository and client methods return `ApplicationResult<T>`:

```typescript
type ApplicationResult<T> = SuccessResult<T> | FailureResult;

// Usage
const result = await repository.get(id, clientId);
if (result.error) {
  return result; // Propagate failure
}
const data = result.data; // Access success data
```

Use `success()` and `failure()` helpers from `@backend-api/utils/result`:

```typescript
return success(data);
return failure(ErrorCase.NOT_FOUND, 'Entity not found');
return failure(ErrorCase.VALIDATION_FAILED, 'Invalid input', error, { details: 'extra info' });
```

### Optimistic Locking

Entities use `lockNumber` for optimistic concurrency control:

- Client must provide current `lockNumber` for update/delete/submit operations
- Repository increments `lockNumber` on successful write
- Returns `409 CONFLICT` if lock number mismatch

### DynamoDB Transaction Pattern

For operations requiring atomic writes with validation, use `TransactWriteCommand`:

```typescript
await this.client.send(
  new TransactWriteCommand({
    TransactItems: [
      {
        Update: updateCommand,  // Main entity update
      },
      // ConditionChecks for related entities
      ...relatedIds.map((id) => ({
        ConditionCheck: {
          TableName: this.relatedTableName,
          Key: { id, owner: this.clientOwnerKey(clientId) },
          ConditionExpression: 'attribute_exists(id) AND someCondition',
          ExpressionAttributeValues: { ... },
        },
      })),
    ],
  })
);
```

**Important:** DynamoDB ConditionChecks can only validate:

- Existence of items (`attribute_exists`)
- Simple attribute comparisons
- Status checks (`attribute IN (:val1, :val2)`)

They **cannot** iterate over arrays or validate complex nested structures. For array/document validation, fetch the data first and validate in application code.

### Error Handling in Transactions

Handle `TransactionCanceledException` by inspecting `CancellationReasons`:

```typescript
private handleTransactionError(
  err: unknown,
  lockNumber: number,
  relatedIds: string[]
): ApplicationResult<Entity> {
  if (!(err instanceof TransactionCanceledException)) {
    return this.handleUpdateError(err, lockNumber);
  }

  // First item is always the main update
  const [updateReason, ...relatedReasons] = err.CancellationReasons ?? [];

  if (updateReason && updateReason.Code !== 'None') {
    // Main update failed - handle status/lock errors
    return this.handleUpdateError(
      new ConditionalCheckFailedException({
        message: updateReason.Message!,
        Item: updateReason.Item,
        $metadata: err.$metadata,
      }),
      lockNumber
    );
  }

  // Check which related items failed
  const failedIds = relatedReasons
    .map((reason, index) =>
      reason.Code === 'ConditionalCheckFailed' ? relatedIds[index] : null
    )
    .filter((id): id is string => id != null);

  if (failedIds.length > 0) {
    return failure(ErrorCase.VALIDATION_FAILED, 'Related items validation failed', err, {
      ids: failedIds.join(','),
    });
  }

  return this.handleUpdateError(err, lockNumber);
}
```

### Validation Pattern

For complex validation that can't be done in DynamoDB:

1. **Fetch** the entity first
2. **Validate** in application code
3. **Execute** the transaction

```typescript
async submit(id: string, user: User, lockNumber: number): Promise<ApplicationResult<Entity>> {
  // 1. Fetch for validation
  const existing = await this.get(id, user.clientId);
  if (existing.error) return existing;

  // 2. Validate in application code
  const validationError = this.validateForSubmit(existing.data);
  if (validationError) return validationError;

  // 3. Execute transaction with DynamoDB-level checks
  try {
    await this.client.send(new TransactWriteCommand({ ... }));
    // ...
  } catch (error) {
    return this.handleTransactionError(error, lockNumber, ids);
  }
}
```

## Testing Patterns

### Repository Tests

Located in `src/__tests__/infra/{repository-name}/`. Use `aws-sdk-client-mock`:

```typescript
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';

const dynamo = mockClient(DynamoDBDocumentClient);

function setup() {
  dynamo.reset();  // Reset mock state between tests
  // ...
}
```

**Chaining mock responses** for multiple calls to the same command:

```typescript
// Correct: chain resolvesOnce calls
mocks.dynamo
  .on(GetCommand)
  .resolvesOnce({ Item: firstResponse })
  .resolvesOnce({ Item: secondResponse });

// Wrong: separate calls don't queue
mocks.dynamo.on(GetCommand).resolvesOnce({ Item: firstResponse });
mocks.dynamo.on(GetCommand).resolvesOnce({ Item: secondResponse }); // Overwrites!
```

### Client Tests

Located in `src/__tests__/app/`. Mock repositories using `jest-mock-extended`:

```typescript
import { mock } from 'jest-mock-extended';
import type { Repository } from '../../infra/repository';

const repository = mock<Repository>();
```

### Test Fixtures

Use factory functions in `src/__tests__/fixtures/`:

```typescript
export const entity: Entity = { /* default values */ };

export const makeEntity = (overrides: Partial<Entity> = {}): Entity => ({
  ...entity,
  id: randomUUID(),
  ...overrides,
});
```

## Running Tests

```bash
# From lambda directory
npm run test:unit

# Specific test file
npx jest src/__tests__/infra/repository.test.ts --no-coverage

# Specific test pattern
npx jest --testPathPattern="repository" --testNamePattern="submit"
```

## Common Error Cases

From `nhs-notify-backend-client`:

| ErrorCase                             | HTTP Code | Use For                              |
| ------------------------------------- | --------- | ------------------------------------ |
| `NOT_FOUND`                           | 404       | Entity doesn't exist or is deleted   |
| `VALIDATION_FAILED`                   | 400       | Input validation failures            |
| `ALREADY_SUBMITTED`                   | 400       | Entity already in final state        |
| `CONFLICT`                            | 409       | Lock number mismatch                 |
| `INTERNAL`                            | 500       | Unexpected errors                    |
| `ROUTING_CONFIG_TEMPLATES_NOT_FOUND`  | 400       | Referenced templates missing         |

## Agent Checklist

When modifying lambda code:

- [ ] Follow the layered architecture (entry → api → app → infra)
- [ ] Return `ApplicationResult<T>` from repository/client methods
- [ ] Use `TransactWriteCommand` for atomic operations with related entity checks
- [ ] Handle `TransactionCanceledException` by inspecting `CancellationReasons`
- [ ] Add/update tests mirroring the source structure
- [ ] Run `npm run test:unit` in the lambda directory
- [ ] Run `npm run typecheck` to verify types

## Schema and Type System

### Type Generation Pipeline

Types are generated from OpenAPI specifications. The pipeline flows:

```text
spec.tmpl.json → (Terraform templating) → spec.json → (openapi-typescript) → generated.d.ts
```

**Key files:**

- `infrastructure/terraform/modules/backend-api/spec.tmpl.json` - Source OpenAPI spec (with Terraform template vars)
- `lambdas/backend-client/src/types/generated.d.ts` - Generated TypeScript types

**To regenerate types after spec changes:**

```bash
cd lambdas/backend-client
npm run generate-dependencies
```

### Zod Schemas with `schemaFor`

Zod schemas in `backend-client` use the `schemaFor` helper for type-safety:

```typescript
import { z } from 'zod/v4';
import type { MyType } from '../types/generated';
import { schemaFor } from './schema-for';

// This ensures the Zod schema matches the generated TypeScript type
const $MyType = schemaFor<MyType>()(
  z.object({
    field: z.string(),
  })
);
```

**Why `schemaFor`?** It provides compile-time verification that the Zod schema produces the same shape as the generated type. If the schema doesn't match the type, TypeScript will error.

### Validation Schemas (Submittable Pattern)

For workflows that require stricter validation than the base schema (e.g., "submit" operations), create extended schemas:

```typescript
// Base schema allows optional/nullable fields for draft state
const $CascadeItem = schemaFor<CascadeItem>()(
  z.object({
    defaultTemplateId: z.string().nonempty().nullable(),  // Can be null in drafts
    // ...
  })
);

// Submittable schema enforces fields required for submission
export const $SubmittableCascadeItem = $CascadeItem.and(
  z.object({
    // Override: defaultTemplateId can be missing, but can't be null
    defaultTemplateId: z.string().nonempty().optional(),
  })
);

export const $SubmittableCascade = z.array($SubmittableCascadeItem).nonempty();
```

**Usage in repository:**

```typescript
const parseResult = $SubmittableCascade.safeParse(existing.data.cascade);
if (!parseResult.success) {
  return failure(
    ErrorCase.VALIDATION_FAILED,
    'Routing config is not ready for submission',
    new Error(parseResult.error.message)
  );
}
```
