# Event Schemas Agent Guide

> Applies to the `packages/event-schemas` workspace. For core agent rules see root `agents.md`; for TypeScript service code patterns see `lambdas/agents-typescript.md`.

---
## 1. Purpose & Scope
Provide a consistent, versioned source of truth for Template Management domain events, including:
- Zod validators & inferred TypeScript types
- Generated JSON Schemas (AJV compatibility)
- Example payloads per channel (email, sms, letter, nhsapp)

Agents modifying this package must preserve backwards compatibility for existing published versions unless an intentional breaking change is explicitly authorised.

## 2. Engagement Preconditions
Before an agent starts:
1. Ticket specifies new event or version increment (include rationale & acceptance criteria).
2. Confirms whether change is additive (new event / new optional field) or breaking (field removal, type narrowing). Breaking = major version bump (new top-level version folder).
3. Branch already created by human.

## 3. Directory Layout Essentials
```
packages/event-schemas/
  schemas/<EventName>/v1.json          # Generated (do not hand edit)
  examples/<EventName>/v1/*.json       # Hand-authored canonical examples
  src/events/<kebab-or-lower>.ts       # Zod schema + export
  src/template.ts / event-envelope.ts  # Shared structures
  scripts/generate-json-schemas.ts     # Generation entrypoint
  __tests__/{events,json-schemas}/*.test.ts
```
Conventions:
- Event folders PascalCase matching event type (e.g. `TemplateCompleted`).
- Version subfolder `v<semver-major>` (currently v1 only). Minor/patch differences are handled inside schema evolution (additive optional fields) without folder duplication.

## 4. Event Versioning Rules
| Change Type | Action | Example |
|-------------|--------|---------|
| Add optional field | Same major | Add `proofCount?: number` to v1 schema as `.optional()` |
| Add required field | New major (v2) | Introducing mandatory `templateType` when absent before |
| Remove field | New major | Dropping `channel` property |
| Type widening (string -> enum superset) | Same major | Enum extended with additional literal |
| Type narrowing (enum shrink) | New major | Removing a literal from channel enum |

Never retroactively alter semantics of existing published version.

## 5. Creating a New Event (Additive Flow)
1. Add Zod schema file `src/events/<event-kebab>.ts` exporting `$<EventName>Event` & `<EventName>Event` type.
2. Update `src/events/index.ts` and root `src/index.ts` to export new event symbols.
3. Add example payloads under `examples/<EventName>/v1/` for each supported channel.
4. Run generation script to produce JSON schema: `npm run generate-json-schemas --workspace @nhsdigital/nhs-notify-event-schemas-template-management` (or at root `npm run generate-json-schemas --workspaces`).
5. Add tests:
   - `__tests__/events/<event-lower>.test.ts` validating Zod parse (valid+invalid cases).
   - `__tests__/json-schemas/<event-lower>.test.ts` loading generated schema & validating sample with AJV.
6. Increment package version (patch or minor depending on impact) in `package.json`.
7. Update README event list.
8. Provide handover summary including new symbols, version bump rationale, schema diff.

## 6. Adding a New Major Version of Existing Event
1. Duplicate existing version JSON schema & examples to `schemas/<EventName>/v<next>` and `examples/<EventName>/v<next>/`.
2. Introduce new Zod schema (e.g. `$TemplateCompletedEventV2`) optionally reusing `.extend()` from v1.
3. Modify `src/version.ts` if global version utility is affected.
4. Keep both versions exportable; do NOT remove v1.
5. Add tests verifying both versions parse their respective examples.
6. Major version bump in `package.json`.

## 7. Zod Schema Authoring Standards
- Prefix validators with `$` (e.g. `$TemplateDraftedEvent`).
- Compose via `.extend()` for additive fields; prefer `.pick()` / `.omit()` sparingly (maintain clarity over brevity).
- All enums defined inline or reused constant arrays (freeze arrays and use `z.enum([...])`).
- Include `.describe()` for each top-level property to enrich generated JSON Schema descriptions.
- Avoid business logic in schemas (pure shape + simple refinement). Complex validation belongs upstream in service code.

## 8. JSON Schema Generation
Never hand edit files in `schemas/`. They are produced by running:
```bash
npm run generate-json-schemas --workspace @nhsdigital/nhs-notify-event-schemas-template-management
```
Agent must regenerate after any Zod change and include updated artifacts in the commit.

## 9. Example Payload Standards
- One JSON file per channel variant (email, sms, letter, nhsapp). Use kebab-case filenames only if multiple variations (e.g. `letter-with-proofs.json`).
- Keep minimal representative fields; do not insert extraneous properties for noise.
- Ensure examples align with Zod schema default/optional logic.

## 10. Testing Requirements
Minimum for a new or changed event:
| Test | Purpose |
|------|---------|
| `events/<event>.test.ts` | Valid + invalid Zod parse cases |
| `json-schemas/<event>.test.ts` | AJV validation of examples against generated JSON schema |

Edge cases to include: missing required field, invalid enum value, invalid nested object property.

## 11. Quality Gates
Run before handover:
```bash
npm run typecheck --workspace @nhsdigital/nhs-notify-event-schemas-template-management
npm run lint --workspace @nhsdigital/nhs-notify-event-schemas-template-management
npm run test:unit --workspace @nhsdigital/nhs-notify-event-schemas-template-management
npm run generate-json-schemas --workspace @nhsdigital/nhs-notify-event-schemas-template-management
```
Confirm no unintended diff in unrelated schemas.

## 12. Publishing & Versioning
- `prepublishOnly` script runs build (transpile TS -> JS) prior to publish.
- Increment semver in `package.json` following: major (breaking), minor (additive features), patch (fix / doc-only with regenerated schema producing identical output).
- Provide changelog note in PR description (no separate CHANGELOG file yet—can be added later).

## 13. Agent Responsibilities (Package Specific)
1. Do not remove historical versions.
2. Keep exports stable; adding is fine, renaming requires major bump.
3. Ensure examples & schemas stay synchronised (regen script output committed).
4. Avoid leaking secrets—test fixtures contain only synthetic values.
5. Provide summary diff (fields added/removed/types changed) in handover.

## 14. Common Pitfalls & Anti-Patterns
| Pitfall | Corrective Action |
|---------|------------------|
| Editing generated schema manually | Revert & regenerate via script |
| Adding required field in same major | Either mark optional or create new major version |
| Divergent examples (extra undeclared field) | Update schema (if valid new optional) or remove field |
| Tests only covering happy path | Add at least one invalid case |
| Missing README update for new event | Append to list alphabetically |

## 15. Rationale Comment Pattern
Use only when deviating (e.g. accepting legacy field naming):
```ts
// agent: rationale maintaining legacy field 'tmpl_id' until producer migrates
```
Remove once no longer needed.

## 16. Handover Checklist
- [ ] Ticket referenced & scope confirmed (additive vs breaking)
- [ ] New/updated Zod schemas added
- [ ] Examples added/updated per channel
- [ ] JSON schemas regenerated & committed
- [ ] Tests added/updated (valid + invalid cases)
- [ ] Package version bumped appropriately
- [ ] README event list updated
- [ ] Handover summary lists field-level diff

## 17. Future Enhancements
- Introduce automated diff tool to compare schema versions & emit changelog.
- Add JSON Schema meta (e.g. `$id`) for better tooling integration.
- Provide script to auto-generate invalid example fixtures for negative tests.

## 18. Changelog (Guide)
- 2025-11-07: Initial creation of `packages/event-schemas/agents.md`.
