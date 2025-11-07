# TypeScript Style & Ways of Working (Agents & Copilot)

> Extracted from root `agents.md` Section 16 (2025-11-07). Terraform-specific guidance now lives in `infrastructure/terraform/agents-terraform.md`.

This document defines conventions for TypeScript across Lambdas, shared packages and the Next.js frontend. It complements Terraform guidance (security, determinism, least privilege) with code-level consistency, testability and readability. Use these rules for both autonomous agent code generation touching TypeScript and interactive AI pair programming (Copilot).

## 1. Project Structure & Module Boundaries
- Each Lambda function lives in `lambdas/<function-name>` with `src/`, `__tests__/`, build script (`build.sh` using `esbuild`), output in `dist/`.
- Backend API Lambdas: thin entry file delegating to API handler factory.
```ts
export const handler = createHandler(templatesContainer());
```
- Domain logic separated from transport (e.g. `api/` vs `domain/`). Keep handler composition pure/injectable.
- Shared packages expose `index.ts` re-export barrels.

## 2. Naming Conventions (ESLint-Enforced)
Follow the repository ESLint configuration rather than relying on this document for exhaustive rules. Key points are enforced automatically:
| Concern | Enforcement Source |
|---------|--------------------|
| Filenames (kebab-case for files) | Custom/file naming lint rules & PR review |
| Exported functions/constants camelCase | ESLint stylistic rules |
| Types & interfaces PascalCase | `@typescript-eslint/naming-convention` |
| Handler export name `handler` | Manual review + tests referencing handler |
| Zod schemas prefixed with `$` | Convention (add if missing); not auto-enforced |
| Factory functions suffix `create`/`make` | Convention to enhance intent |

Agent guidance: Run `npm run lint` and fix reported issues; do not duplicate rule text here. If a required naming change would create wide churn, limit edits to touched lines and add a `// agent: rationale partial naming normalisation` comment if inconsistent legacy remains.

## 3. Import Ordering (ESLint-Enforced)
Ordering (built-ins → external → internal aliases → relative) is governed by ESLint (`import/order`). Agents should:
1. Avoid manual reordering of untouched blocks unless lint fails.
2. Preserve grouping and let `--fix` handle spacing/blank lines.
3. If adding a new import, place it in the correct group; run `npm run lint:fix` to auto-format.

Do not include example blocks; the linter output will indicate misplacement. Add rationale comment only if a deliberate cycle prevents ideal ordering.

## 4. Types vs Interfaces
Use `type` for unions/intersections; `interface` for extensible object shapes. Use `z.infer<typeof $Schema>` for types derived from Zod.

## 5. Runtime Validation & Schema Design
- Validate all external input with Zod at the boundary; parse early.
- Use `.extend`, `.intersection`, `.omit` to compose.
- Include `.meta({ id: '...' })` for identification.

## 6. Environment Variables & Configuration
- Validate env vars (Zod object). Coerce numeric values.
- Parse complex JSON only after validation.
- Throw early if required vars absent.

## 7. Error Handling Patterns
- API handlers return structured success/failure objects; avoid throwing for expected validation failures.
- Batch SQS: validate each record; DLQ or skip unprocessable payloads.

## 8. Functional Composition & Dependency Injection
- Use factory functions returning handlers.
- Containers construct dependency graph (clients, repositories, loggers) and return pure objects.
- Avoid global singletons except for AWS SDK efficiency; pass constructed clients.

## 9. CSV / Data Processing
- Deterministic header set from union of record keys; sorted alphabetically.
- RFC4180 escaping (double quotes, wrap fields containing comma/quote/newline).
- Keep transformation functions pure and test them.

## 10. Testing Conventions
- Jest config per package; test files `__tests__/<name>.test.ts`.
- Mock AWS SDK v3 clients by overriding `send`.
- Use shared test helper factories (e.g. `makeSQSRecord`, `createMockLogger`).
- Assert observable response shapes; avoid internal implementation details.

## 11. Async & Promise Handling
Use `async/await`. Sequential `for...of` loops for ordered processing; `Promise.all` only for independent operations.

## 12. Logging
- Use structured `winston` logger; inject via container.
- Log identifiers (templateId, clientId) not full sensitive payloads.

## 13. Security & PII
- Never log secrets or personal data; redact or summarise.
- Centralise CSP construction with nonce in frontend middleware.

## 14. Performance & Memory
- Lambda memory: 512 MB default (light); 2048 MB for heavy tasks (PDF, complex transform). Justify deviations with comment.
- Avoid unnecessary JSON (de)serialization cycles.

## 15. Formatting & Lint
Formatting (quotes, semicolons, trailing commas, spacing) and stylistic concerns are entirely delegated to ESLint/Prettier configuration in the repo. Agent process:
1. After code changes run: `npm run lint` and `npm run lint:fix` (if permitted) to apply canonical style.
2. Do not handcraft style changes beyond what the linter requires for the modified lines.
3. If large unrelated formatting noise appears, revert non-essential edits to minimise diff surface.

Examples are intentionally omitted; rely on linter output for corrections.

## 16. Export Strategy
- Prefer named exports. Use barrel `index.ts` for re-exports. Avoid CommonJS patterns.

## 17. Utility Patterns
- Inline single-use pure utilities; extract to `utils/` if reused >2 times.
- Group regex or security policies in top-level constants.

## 18. Testing Edge Cases (Minimum)
For each handler include: happy path, missing/invalid auth/env, validation failure, empty batch (no-op).

## 19. Error Object Shape
Standard failure JSON: `{ statusCode, technicalMessage, details? }`. No internal stack traces to clients.

## 20. Comment Standards
- Use `//` for brief notes; block comments only for multi-line protocol references.
- Link external specs (e.g. CloudEvents) where relevant.

## 21. AI / Agent Usage Notes (TypeScript)
- Provide a mini contract before requesting generation: inputs, outputs, error modes, key edge cases.
- Reject suggestions lacking types or validation.
- Ensure new handlers follow dependency injection & logging patterns.
- Use commit convention `<JIRA-ID> <imperative summary>`.
- Annotate any deviation with `// agent: rationale <brief>`.

## 22. Quality Gates (When TS code is generated/modified)
Run locally before handover:
```bash
npm run typecheck
npm run lint
npm run test:unit
```
(Include accessibility tests if frontend changes: `npm run test:accessibility`.)
