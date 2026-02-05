# AGENTS.md - Test Team
<!-- vale off -->

## Scope

This file provides guidance for AI agents working on automated tests in this repository. For general repository guidance, see the root `AGENTS.md`.

## Directory Structure

```text
tests/test-team/
├── template-mgmt-api-tests/       # API integration tests
├── template-mgmt-component-tests/ # Component tests (page-level)
├── template-mgmt-e2e-tests/       # End-to-end user journey tests
├── template-mgmt-event-tests/     # Event-driven tests
├── template-mgmt-routing-component-tests/  # Routing config component tests
├── helpers/
│   ├── auth/                      # Cognito authentication helpers
│   ├── db/                        # Database storage helpers
│   ├── factories/                 # Test data factories
│   ├── client/                    # API client helpers
│   └── ...
├── fixtures/                      # Shared test fixtures
└── config/                        # Playwright configuration
```

## API Tests

API tests are located in `template-mgmt-api-tests/` and use Playwright's request API to test backend endpoints directly.

### Test File Structure

```typescript
import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import {
  createAuthHelper,
  type TestUser,
  testUsers,
} from '../helpers/auth/cognito-auth-helper';
import { RoutingConfigStorageHelper } from '../helpers/db/routing-config-storage-helper';
import { TemplateStorageHelper } from '../helpers/db/template-storage-helper';
import { RoutingConfigFactory } from '../helpers/factories/routing-config-factory';
import { TemplateFactory } from '../helpers/factories/template-factory';

test.describe('PATCH /v1/routing-configuration/:id/submit', () => {
  const authHelper = createAuthHelper();
  const storageHelper = new RoutingConfigStorageHelper();
  const templateStorageHelper = new TemplateStorageHelper();
  let user1: TestUser;

  test.beforeAll(async () => {
    user1 = await authHelper.getTestUser(testUsers.User1.userId);
  });

  test.afterAll(async () => {
    await storageHelper.deleteSeeded();
    await templateStorageHelper.deleteSeededTemplates();
  });

  test('returns 200 and the updated data', async ({ request }) => {
    // 1. Create test data using factories
    const templateId = randomUUID();
    const template = TemplateFactory.createNhsAppTemplate(templateId, user1, 'Test');
    await templateStorageHelper.seedTemplateData([template]);

    const { dbEntry } = RoutingConfigFactory.create(user1, { /* overrides */ });
    await storageHelper.seed([dbEntry]);

    // 2. Make the API request
    const response = await request.patch(
      `${process.env.API_BASE_URL}/v1/routing-configuration/${dbEntry.id}/submit`,
      {
        headers: {
          Authorization: await user1.getAccessToken(),
          'X-Lock-Number': String(dbEntry.lockNumber),
        },
      }
    );

    // 3. Assert response
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.status).toBe('COMPLETED');
  });
});
```

### Key Helpers

#### Authentication (`helpers/auth/cognito-auth-helper.ts`)

```typescript
const authHelper = createAuthHelper();
const user = await authHelper.getTestUser(testUsers.User1.userId);

// Get access token for API requests
const token = await user.getAccessToken();

// User properties
user.clientId;      // Client ID for ownership checks
user.campaignId;    // Default campaign ID
```

Pre-configured test users with different permissions:

- `testUsers.User1` - Standard user
- `testUsers.User2` - User with routing disabled
- `testUsers.User7` - User sharing same client as User1
- `testUsers.UserRoutingEnabled` - User with different client

#### Storage Helpers (`helpers/db/`)

Seed test data directly into DynamoDB:

```typescript
const storageHelper = new RoutingConfigStorageHelper();
const templateStorageHelper = new TemplateStorageHelper();

// Seed data
await storageHelper.seed([dbEntry1, dbEntry2]);
await templateStorageHelper.seedTemplateData([template1, template2]);

// Clean up in afterAll
await storageHelper.deleteSeeded();
await templateStorageHelper.deleteSeededTemplates();
```

#### Factories (`helpers/factories/`)

Create test data with sensible defaults:

```typescript
// Routing configs
const { dbEntry, apiResponse } = RoutingConfigFactory.create(user, {
  status: 'DRAFT',
  cascade: [{ /* cascade item */ }],
});

// Templates
const nhsAppTemplate = TemplateFactory.createNhsAppTemplate(id, user, 'Name');
const emailTemplate = TemplateFactory.createEmailTemplate(id, user, 'Name', 'NOT_YET_SUBMITTED');
const smsTemplate = TemplateFactory.createSmsTemplate(id, user, 'Name');
const letterTemplate = TemplateFactory.uploadLetterTemplate(
  id,
  user,
  'Name',
  'PROOF_APPROVED',  // templateStatus
  'PASSED',          // virusScanStatus
  { language: 'fr', letterType: 'x0' }  // options
);
```

### Test Patterns

#### Testing Validation Errors

```typescript
test('returns 400 if validation fails', async ({ request }) => {
  const { dbEntry } = RoutingConfigFactory.create(user1, {
    cascade: [{ /* invalid cascade */ }],
  });
  await storageHelper.seed([dbEntry]);

  const response = await request.patch(`${url}/${dbEntry.id}/submit`, {
    headers: {
      Authorization: await user1.getAccessToken(),
      'X-Lock-Number': String(dbEntry.lockNumber),
    },
  });

  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({
    statusCode: 400,
    technicalMessage: 'Expected error message',
  });
});
```

#### Testing Authorization

```typescript
test('returns 401 if no auth token', async ({ request }) => {
  const response = await request.patch(url, {
    headers: { 'X-Lock-Number': '0' },  // No Authorization header
  });
  expect(response.status()).toBe(401);
});

test('returns 404 if owned by different client', async ({ request }) => {
  const { dbEntry } = RoutingConfigFactory.create(user1);
  await storageHelper.seed([dbEntry]);

  const response = await request.patch(`${url}/${dbEntry.id}`, {
    headers: {
      Authorization: await userDifferentClient.getAccessToken(),
      'X-Lock-Number': String(dbEntry.lockNumber),
    },
  });
  expect(response.status()).toBe(404);  // Not 403 - don't leak existence
});
```

#### Testing Optimistic Locking

```typescript
test('returns 409 if lock number mismatch', async ({ request }) => {
  const { dbEntry } = RoutingConfigFactory.create(user1);
  await storageHelper.seed([dbEntry]);

  const response = await request.patch(`${url}/${dbEntry.id}`, {
    headers: {
      Authorization: await user1.getAccessToken(),
      'X-Lock-Number': String(dbEntry.lockNumber + 1),  // Wrong lock number
    },
  });
  expect(response.status()).toBe(409);
});
```

### Avoiding Redundant Tests

When adding tests, consider whether the scenario is already covered:

1. **Happy path with full response validation** - One comprehensive test is usually enough
2. **Each distinct error type** - One test per unique error message/code
3. **Boundary conditions** - Test the boundaries, not every value

For example, if testing template status validation:

- ✅ One test for invalid status (e.g., `NOT_YET_SUBMITTED`)
- ✅ One test for valid status (e.g., `PROOF_APPROVED`)
- ❌ Don't need separate tests for every valid status (`PROOF_APPROVED` AND `SUBMITTED`)

### Running API Tests

```bash
# From tests/test-team directory
npm run test:api

# Run specific test file
npx playwright test submit-routing-config.api.spec.ts

# Run with UI mode for debugging
npx playwright test --ui
```

## Quality Checklist

Before submitting API test changes:

- [ ] Tests clean up seeded data in `afterAll`
- [ ] Use `randomUUID()` for IDs to avoid collisions
- [ ] Test both success and failure paths
- [ ] Assert on response status AND body
- [ ] No redundant tests covering same scenario
- [ ] Factory methods used (don't construct raw objects)
