## Core Agent Guidance (Platform-Agnostic)

This file now focuses on cross-cutting agent usage principles that apply regardless of technology (Terraform, TypeScript, frontend). Technology-specific detail has moved to:

| Domain | Location |
|--------|----------|
| Terraform (Infra workflow, IAM, modules) | `infrastructure/terraform/agents-terraform.md` |
| TypeScript (Lambdas, shared packages, frontend) | `lambdas/agents-typescript.md` |

_Last reorganised: 2025-11-07_

### 1. Engagement Model
Human creates branch & supplies ticket context (JIRA ID, acceptance criteria, scope, non-goals). Agent never creates branches or merges; it produces validated changes then stops.

### 2. Agent Responsibilities (Invariant)
1. Operate only inside provided branch.
2. Minimise surface area of change; no speculative refactors.
3. Apply existing naming, logging, validation, and security patterns.
4. Annotate unavoidable deviations with a concise rationale comment (`// agent: rationale <brief>` or `# agent: rationale <brief>`).
5. Run relevant quality gates (typecheck, lint, tests, terraform validate) before handover.
6. Produce a handover summary (files touched, IAM delta, risks, rollback hint).

### 3. Quality Gates (Selector)
| Scenario | Required Gates |
|----------|----------------|
| Pure Terraform change | `terraform fmt`, `terraform validate` |
| Lambda / TypeScript code | `npm run typecheck`, `npm run lint`, `npm run test:unit` |
| Frontend (React/Next) | Above + accessibility tests if UI affected |
| Mixed (Infra + Code) | Union of both sets |

Optional (on demand): gitleaks, trivy, syft, scorecard.

### 4. Adding a New Lambda (Workspace & Build Integration)
Follow this process so monorepo workspaces, build scripts and infra remain consistent:

1. Create folder: `lambdas/<function-name>` using kebab-case.
2. Scaffold contents:
   - `package.json` (private, name `@notify/<function-name>`, scripts: `build`, `typecheck`, `lint`, `test:unit`).
   - `tsconfig.json` (extends root or sibling lambda config).
   - `jest.config.ts` (mirroring existing lambda configs).
   - `build.sh` invoking `esbuild` bundling to `dist/`.
   - `src/` with entry file exporting `handler` and domain modules.
   - `__tests__/` with at least happy path + one failure case.
3. Add workspace entry in root `package.json` under `workspaces` (maintain alphabetical grouping by top-level path).
4. Run: `npm install` at root to ensure workspace linking.
5. Add infrastructure module invocation (Terraform) in appropriate `.tf` file referencing new lambda dist path & env vars.
6. Provide minimal IAM policy document (`data "aws_iam_policy_document"`) granting least privilege.
7. Update any shared environment variable local maps if new keys required.
8. Execute quality gates for both infra & TS (see table above).
9. Include in handover summary: workspace addition, new module file(s), IAM diff, test coverage note.

### 5. Monorepo Workspace Conventions
Root `package.json` uses npm workspaces. Keep order logical (group by area). When adding a lambda ensure:
```
"workspaces": [
  "data-migration/user-transfer",
  "frontend",
  "lambdas/authorizer",
  "lambdas/backend-api",
  "lambdas/backend-client",
  "lambdas/cognito-triggers",
  "lambdas/download-authorizer",
  "lambdas/event-publisher",
  "lambdas/sftp-letters",
  "lambdas/<new-function>",
  "packages/event-schemas",
  ...
]
```
Position `<new-function>` with existing lambda block (keep alphabetical within that block to reduce diff churn).

### 6. CI / Automation Notes
- Scorecard workflow (`.github/workflows/scorecard.yml`) runs on `main` push & scheduled; agent changes should not adjust it unless explicitly tasked.
- Future CI additions (tests, security scans) should live in dedicated workflow files named by concern (`test.yml`, `security.yml`).
- Do not embed secrets in workflow; reference pre-defined repository secrets.
- Pin action versions (use commit SHA or semver tag) for reproducibility.
- If adding a workflow, include a short comment header with purpose and contact.

### 7. Commit Guidelines (Universal)
Format: `<JIRA-ID> <imperative summary>` (no trailing period). Keep commits cohesive (infra vs code). Avoid mixing refactor with feature unless mandated.

### 8. Rationale Comment Pattern
Keep to a single line:
```hcl
# agent: rationale increase memory (PDF generation spikes >512MB)
```
```ts
// agent: rationale temporary union type until schema v2 lands
```
Remove obsolete rationales before handover if decision becomes standard.

### 9. Rollback Considerations
- Infra: prefer additive changes; for destructive (table rename, pipe removal) document pre-change state.
- Code: if altering handler signature, note previous export contract.
- Provide one-line rollback instruction in handover summary.

### 10. Escalation / Blockers
If blocked by unavailable secret, unclear architectural constraint, or missing upstream module, stop and ask a single clarifying question rather than guessing.

### 11. Where to Go for Detail
- Terraform specifics: `infrastructure/terraform/agents.md`
- TypeScript & Lambda specifics: `lambdas/agents.md`
- Shared schemas & events: `packages/event-schemas/agents.md`
- Scripts: `scripts/agents.md`