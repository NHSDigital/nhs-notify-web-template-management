# Terraform Agents Guide (agents.md)

> Authoring instructions for AI coding assistants ("agents") contributing to `nhs-notify-web-template-management` infrastructure. This guide focuses exclusively on Terraform: produce small, secure, testable, idiomatic changes that integrate smoothly with existing modules and patterns.

---
## 1. Purpose & Scope
This document defines how automated agents should:
- Inspect and modify Terraform infrastructure code in `infrastructure/terraform` (root modules & nested modules).
- Maintain security, least privilege IAM, encryption, determinism, and consistency.
- Minimise disruption while accelerating delivery and enabling reuse via shared modules.

## 2. Core Principles
1. Precision over breadth – change only what the ticket requires.
2. Security first – never introduce secrets or broaden IAM unnecessarily.
3. Test before you declare completion (unit + accessibility + type + lint + Terraform validation).
4. Consistent naming – match existing patterns (see sections below).
5. Explain deviations inline with `// agent: rationale` comments (keep rare & concise).
6. Reusability – prefer utilities / hooks / modules already present before adding new ones.

## 3. Infrastructure Stack Overview
| Area | Tools / Services |
|------|------------------|
| Infrastructure as Code | Terraform (version pinned via `.tool-versions`) |
| AWS Services | Lambda, API Gateway (REST), DynamoDB, SSM Parameter Store, S3, CloudWatch Logs / Events, SNS, SQS (FIFO w/ DLQ), EventBridge Pipes, GuardDuty Malware Protection |
| Encryption | KMS customer-managed keys (passed as `var.kms_key_arn`) |
| Observability | CloudWatch Logs (retention via `log_retention_in_days`), optional Firehose subscription |
| Security / Scanning | gitleaks, trivy, syft, pre-commit hooks |
| Shared Modules | `nhs-notify-shared-modules` release ZIPs (version-pinned) |

## 4. Workflow Expectations & Handover
Agent starts only after a human creates and checks out a correctly named branch and shares JIRA ticket context. Agent never creates branches or performs merges.

Human (before engaging agent):
1. Create branch: `feature/<JIRA-ID>_<short-kebab-summary>` or `fix/<JIRA-ID>_<summary>`.
2. Supply ticket acceptance criteria, scope boundaries, any explicit non-goals.
3. Ensure required variables/secrets already exist (agent must not introduce secrets).

Agent duties:
1. Operate strictly within existing branch (no rename/rebase/merge).
2. Implement minimal scoped changes with tests/docs tied to ticket.
3. Run / emulate quality gates (see §11) and report PASS/FAIL succinctly.
4. Annotate deviations with `# agent: rationale` (keep sparse).
5. Produce handover summary: changes, files touched, IAM impact, risks, rollback note.
6. Stop after code + validation; human handles any further workflow steps.

Human (after handover):
1. Review handover summary and diffs (IAM least privilege, secret absence).
2. Conduct additional compliance scans if needed (tflint, gitleaks, security scanners).
3. Decide on merge/release steps outside scope of this guide.

## 5. Commit & Branch Conventions
Branch naming is a human responsibility (agent does not create branches). Agent ensures commits follow style.
- Branch format (human-created): `feature/CCM-1234_short-description` or `fix/CCM-1234_issue`.
- Commit header: `<JIRA-ID> <imperative summary>` (no trailing period) e.g. `CCM-12833 Add email template validation for subject length`.
- Body (optional): rationale, deviations (`# agent: rationale` references), follow-ups.
- Signed commits if repo policy requires; agent should not introduce merge commits.
- Keep commits small & cohesive: infrastructure changes + matching tests/docs.

## 6. Terraform Style Guide
### 6.1 File & Module Structure
- Group related concerns per file (e.g. individual Lambda module files: `module_create_template_lambda.tf`).
- Keep computed values & shared constants in `locals.tf`.
- Use `outputs.tf` strictly for cross-stack / external consumption values.

### 6.2 Naming Conventions
- Locals & variables: snake_case (e.g. `backend_lambda_environment_variables`).
- Function names (Lambdas): kebab-case (`create-template`, `upload-letter-template`).
- Local composite identifiers: `csi = "${var.csi}-${var.module}"` pattern; replicate when new composite ID needed.
- Environment-specific SSM paths: `/${var.csi}/clients` style; ensure new parameters align with existing path hierarchy.

### 6.3 Modules & Sources
- Prefer shared modules via version-pinned release ZIPs (e.g. `terraform-lambda.zip` with explicit version `v2.0.22`). Always pin.
- When new generic modules could be reused, propose upstream addition to `nhs-notify-shared-modules`.

### 6.4 IAM Policies
- Use `data "aws_iam_policy_document"` blocks; each statement defines `sid`, `effect`, least privilege actions & explicit resource ARNs/patterns.
- Avoid wildcards unless necessary; justify with inline comment `# agent: wildcard required due to X` if used.

### 6.5 Environment Variables
- Centralise Lambda env vars in a local map (`backend_lambda_environment_variables`). Add new keys alphabetically where practical; keep names UPPER_CASE with underscores.

### 6.6 Template Files
- Use `templatefile()` for specs (e.g. OpenAPI). Pass explicit variable map; no implicit references.

### 6.7 Outputs
- Only output values needed externally; name output using resource purpose (`api_base_url`, `templates_table_name`).
- Do not leak sensitive values (e.g. secrets or full IAM policies).

### 6.8 Formatting & Validation
- Enforce `terraform fmt` (agents must format before PR) and run `terraform validate`.
- For planning: include variable files or environment-driven defaults; avoid committing plans.

### 6.9 Version & Providers
- Pin provider versions (if adding providers). Use `>=` cautiously; prefer exact or upper-bounded constraints.

### 6.10 DRY & Repetition
- Extract repeated ARNs or path patterns to locals (e.g. `client_ssm_path_pattern`).
- Use `for` expressions & `jsonencode` for maps when assembling environment variable values.

### 6.10.1 Indentation & Alignment
- Indentation: 2 spaces. Never use tabs (except inside heredoc raw content where unavoidable). Enforce visually in reviews.
- Alignment: In contiguous blocks of single-line parameter assignments within a resource/module, align the equals signs by padding the longest attribute name; values start after one space following `=`. Keep multi-line constructs (lists/maps/heredoc) separated by a blank line from aligned single-line blocks.

Not like:
```
resource "aws_s3_bucket" "logs" {
  bucket = "${local.csi}-logs"
  acl = "private"
  force_destroy = true
}
```
Like:
```
resource "aws_s3_bucket" "logs" {
  bucket        = "${local.csi}-logs"
  acl           = "private"
  force_destroy = true

  tags = local.default_tags
}
```

### 6.10.2 Parameter Ordering & Grouping
- Meta parameters (`count`, `for_each`, `depends_on`, `source`) appear first, in their own aligned block, followed by a blank line.
- tfscaffold / core identification block (`project`, `environment`, `component`, `name`) next for modules.
- Functional parameters follow; if no natural grouping, prefer lexical (alphabetical) order for readability.
- Place complex multi-line parameters (maps/lists/heredocs) in their own separated blocks (blank lines above & below).
- Tags are normally last unless a rationale exists (`# agent: rationale`).

### 6.10.3 Lists & Sets Style
- Multi-value lists/sets use one value per line, trailing comma (even last element) for diff friendliness.
```
vpc_cidrs = [
  "10.0.0.0/16",
  "10.1.0.0/16",
]
```
- Single-value list where design guarantees only one element may be inline: `subnet_ids = [aws_subnet.public.id]`.

### 6.10.4 Maps Style
- One key per line. Do not quote keys unless required (special chars). If any key requires quoting, quote all for consistency.
```
tags = merge(
  local.default_tags,
  {
    Name        = "${local.csi}-logs"
    Description = "Access logs bucket"
  }
)
```

### 6.10.5 File Naming & Structure
- Default case: one resource (or data / provider / module) per file.
- Filename pattern: `<class>_<type>_<name>.tf` with omissions:
  - Omit provider prefix if overwhelmingly single-provider (AWS) (`s3_bucket_logs.tf` instead of `aws_s3_bucket_logs.tf`).
  - Omit the word `resource` (keep `data_`, `module_`, `provider_`).
- Collections exception: related one-to-many objects (e.g. all rules for one security group, DNS records for a zone) may share a file named `<type_plural>_<parent>.tf` (e.g. `security_group_rules_core.tf`). Use sparingly.
- Variables in `variables.tf`; outputs in `outputs.tf`; locals usually `locals.tf` (split when large: `locals_tfscaffold.tf`, `locals_remote_<name>.tf`).

### 6.10.6 Naming (Terraform Object Names)
- Avoid redundancy: do not repeat the resource type in the name (use `aws_subnet.public` not `aws_subnet.public_subnet`).
- Use `main` for the sole instance of a resource type in scope (`aws_vpc.main`).
- Hierarchical pattern:
  - Top-level simple names: `public`, `core`, `frontend`.
  - One-to-many: prefix child with parent: `route_table.public`, `security_group_rule.core_ingress_frontend_https`.
  - Complex relationships: concatenate logical segments with underscores (`lb_frontend_ingress_internet_https`).
- Resource names use snake_case; provider-specific actual names (e.g. S3 bucket `"${local.csi}-logs"`) use kebab-case with CSI prefix.

### 6.10.7 Compound Scope Identifier (CSI)
- Keep `project`, `environment`, `component` short (ideal 4 chars each; max 8). Long CSI reduces remaining characters for provider resource name limits (e.g. target groups, buckets).
- Global CSI includes account/region; consider length impact on global resources (S3 bucket names, etc.).

### 6.10.8 Default Tags
- Define `local.default_tags` alongside `local.csi`:
```
locals {
  csi = format("%s-%s-%s", var.project, var.environment, var.component)
  default_tags = {
    Project     = var.project
    Environment = var.environment
    Component   = var.component
    Name        = local.csi
  }
}
```
- Apply to every taggable resource: `tags = local.default_tags` or merged override for Name.

### 6.10.9 Security Group Rules (AWS)
- All rules for a given security group reside in a single file: `security_group_rules_<group>.tf` separate from the group definition.
- Naming pattern: `<group>_<direction>_<peer>_<service|port>[ _protocol ]`.
  - Direction: `ingress` / `egress` relative to the group.
  - Peer: other SG, `internet`, `whitelist`, etc.
  - Service: well-known name (`http`, `https`, `ssh`) else port number.
  - Protocol suffix only if multiple protocols differentiated.
Example: `core_ingress_frontend_http`, `frontend_egress_core_8080`.

### 6.10.10 Modules Usage
- Use modules only for idempotent, repeatable blocks consumed in multiple places (or environments). Avoid wrapping one-off component-specific resources in private modules—adds indirection without reuse value.
- Consider upstreaming generic patterns to shared modules repo instead of duplicating locally.

### 6.10.11 Conditional Logic
- Avoid environment name ternaries (`var.environment == "qa" ? …`). Prefer explicit boolean or enum variables (`feature_enabled`).
- Pattern:
```
variable "feature_enabled" { type = bool default = false }
resource "aws_example" "feature" { count = var.feature_enabled ? 1 : 0 }
```

### 6.10.12 Inline vs Attachment Resources
- Prefer dedicated attachment/relationship resources over inline blocks to avoid cyclic dependencies (e.g. use separate `aws_security_group_rule` resources instead of inline ingress/egress blocks when bi-directional references exist).

### 6.10.13 IAM Policy Construction & Attachment
- Construct all IAM JSON via `data "aws_iam_policy_document"`—never hand-write raw JSON.
- Prefer many-to-many attachment resources (`aws_iam_role_policy_attachment`, `aws_iam_group_policy_attachment`) over exclusive `aws_iam_policy_attachment` unless size-limit exception applies.
- Large policy exception: if exceeding managed policy size, allowed to use `aws_iam_role_policy` / `aws_iam_group_policy` with justification comment.

### 6.10.14 Provider-Specific Resource Names
- AWS resource `name`/`bucket` parameters: prefix with CSI (`"${local.csi}-<purpose>"`), replace underscores with hyphens for compatibility.
- Use concise suffixes; avoid repeating context already in CSI.

### 6.10.15 Load Balancer Complexity (AWS)
- For ALB/NLB hierarchies: keep listener, target group, listener rule names predictable (e.g. `alb_http`, `alb_https`, `alb_https_grafana`). If single LB only: use `main` for the LB; keep names short to meet AWS length constraints.

### 6.10.16 Templates & Codec Functions
- Use `templatefile()` and `jsonencode` / `yamldecode` etc. for generating structured specs (OpenAPI, ECS task defs, cloud-init). Avoid manual JSON/YAML unless trivial.

### 6.10.17 Commentary Standards
- Use sparse, purposeful comments. Justify deviations (`# agent: rationale <brief>`), lifecycle ignores, large policy exceptions, or module usage outside reuse scenarios.

### 6.10.18 Validation Practices
- Run `terraform fmt -recursive` then manually verify alignment block integrity wasn’t auto-collapsed.
- Do not run `fmt` on `.tfvars` files; preserve intentional formatting.

### 6.11 Resource Naming & Tagging
- Resource names consistently prefixed with `${local.csi}-<purpose>` (e.g. `"${local.csi}-routing-configuration"`, `"${local.csi}-pipe-template-table-events"`). Always derive composite identifiers from locals to ensure cross-module consistency.
- Prefer hyphen-separated purpose descriptors (`-routing-configuration`, `-apig`, `-sns`). Keep them short and specific.
- Tags: follow existing tag keys (e.g. `NHSE-Enable-Dynamo-Backup`); represent booleans as capitalised strings (`"True"` / `"False"`). Introduce new organisation-wide tags only with justification `# agent: rationale`.

### 6.12 DynamoDB Tables
- Use `PAY_PER_REQUEST` billing unless a clear predictable RCU/WCU profile exists.
- Enable `ttl`, `point_in_time_recovery`, and `server_side_encryption` (KMS) for all tables handling template or routing data.
- Stream configuration: enable streams (`NEW_AND_OLD_IMAGES`) when downstream processing (e.g. Pipes to SQS) is required.
- Global Secondary Indexes: add only when justified; use minimal projection (`KEYS_ONLY`) where possible. Name with clear intent (`QueryById`).
- Lifecycle: ignore table `name` when backup/restore workflows may recreate with different timestamped names (`ignore_changes = [name]` plus inline comment explaining why).

### 6.13 SSM Parameters
- Name pattern: `/${local.csi}/<category>/<key>` (e.g. `/${local.csi}/sftp-config/${each.key}`). Keep hierarchy shallow and purposeful.
- Use `SecureString` for any credential-like values; use placeholder values managed externally, adding `lifecycle { ignore_changes = [value] }` to allow rotation outside Terraform.
- Prefer `for_each` with a filtered comprehension for bulk creation (`for k, v in var.letter_suppliers : k => v if k != local.mock_letter_supplier_name`).

### 6.14 Optional / Conditional Resources
- Use `count` for genuinely single optional resources (e.g. mock SFTP config). Use `for_each` for multiple. Gate creation via locals (e.g. `local.use_sftp_letter_supplier_mock`).
- When referencing possibly absent resources externally, wrap in `try()` to provide a safe default (`try(aws_ssm_parameter.sftp_mock_config[0].name, "")`).

### 6.15 CloudWatch Event Rules & Targets
- Build `event_pattern` with explicit `jsonencode` of a map; avoid string interpolation except for ARNs.
- Filter malicious or success cases with structured filters (e.g. `{ anything-but = "NO_THREATS_FOUND" }`).
- Separate rule and targets into distinct resource blocks; each target references its associated lambda module output (`function_arn`).
- Keep rule names aligned with purpose (`-quarantine-scan-failed-for-upload`).

### 6.16 EventBridge Pipes
- Always set `desired_state = "RUNNING"` unless deliberately paused.
- Specify `starting_position = "TRIM_HORIZON"` for DynamoDB streams unless replay reasoning differs.
- Use failure handling features (`on_partial_batch_item_failure = "AUTOMATIC_BISECT"`) to minimise poison batch impact.
- Provide deterministic SQS message grouping / deduplication (`message_group_id` and `message_deduplication_id` referencing stream keys).
- Log configuration: prefer `level = "ERROR"` and include necessary execution data (`include_execution_data = ["ALL"]`) unless cost reduction demands otherwise.
- Use heredoc (`<<-EOF`) for `input_template` with minimal JSON structure referencing event fields.

### 6.17 Lambda Module Configuration Conventions
- Memory sizing: higher (2048 MB) for heavier operations (create / upload / complex transformations); lighter (512 MB) for simple queries or copy tasks. Justify deviations inline if outside these norms.
- Timeout commonly 20s for API-facing endpoints; reduce where possible for short tasks.
- Ordering inside module blocks: source/version, core identifiers (project/environment/component/account/region), encryption (kms_key_arn), function naming, runtime + sizing, logging config, IAM policy document, environment variables, code location, observability (firehose/log destinations), optional DLQ/SNS config.
- When enabling DLQ or notifications set explicit flags (`enable_dlq_and_notifications = true`) and destinations (`sns_destination`).

### 6.18 IAM Policy Authoring
- Keep one `data "aws_iam_policy_document"` per lambda/module with multiple `statement` blocks; each `sid` starts with `Allow` followed by resource/action domain (`AllowDynamoAccess`, `AllowS3InternalWrite`).
- Limit action sets to granular verbs (Query vs Put vs Update) – avoid `dynamodb:*` or `s3:*`.
- Object-level S3 permissions: combine bucket-level list statements (`ListBucket`) with object-level ARNs (`${bucket.arn}/*`) or path-focused prefixes (`${bucket.arn}/pdf-template/*`).
- KMS actions restricted to encryption/decryption/data key generation subset (`Decrypt`, `Encrypt`, `GenerateDataKey*`, `ReEncrypt*`).
- Use explicit service trust policies for roles (`sts:AssumeRole` principal `pipes.amazonaws.com`, `apigateway.amazonaws.com`).
- Attach managed policies only where required (e.g. CloudWatch logging for API Gateway) – prefer custom policy documents otherwise.

### 6.19 Encryption & KMS Patterns
- Always supply `kms_key_arn` to modules supporting encryption (Lambda, Pipes, SNS topics, DynamoDB SSE, SQS module).
- For DynamoDB and SQS modules rely on variable-passed KMS rather than default AWS-managed keys for audit consistency.
- When specifying KMS usage in IAM, include only necessary actions; omit administrative actions (`kms:CreateKey`, etc.).

### 6.20 Secure Strings & Secret Rotation
- Mark secrets managed outside Terraform with `lifecycle.ignore_changes` to avoid drift noise.
- Provide placeholder values where pipeline injection occurs later; do not embed real secrets (never copy values from other environments).
- Document rotation strategy inline if non-obvious (`# agent: rotation handled by external sync job`).

### 6.21 Conditional Logic & Comprehensions
- Prefer inline `for` comprehensions for map construction and filtering (e.g. filtering suppliers or assembling JSON for env vars).
- Use `try()` defensively with optional indexed resources to avoid plan/apply failures when `count = 0`.

### 6.22 Comments & Justifications
- Add concise comments for resources required by upstream modules but not directly used (e.g. SNS topic placeholder). Format: `# this is not used directly; required by <module> dependency`.
- For lifecycle ignores include a one-line justification.
- Minimise speculative commentary; focus on operational rationale.

## 7. Infrastructure Security & Compliance
- KMS usage: restrict actions to necessary encryption/decryption set.
- SSM Parameter access: pattern match only required subtree (`client_ssm_path_pattern`).
- Dynamo/S3 actions: minimal set per Lambda.
- Logging: ensure retention set via variables (`log_retention_in_days`).

## 8. Secrets & Config Management
- Never commit secrets / credentials.
- Environment variables that represent secrets should be fetched from SSM or Secrets Manager, not hard-coded.
- If adding new sensitive configuration: document path structure and encryption approach.

## 9. Performance & Observability
- Lambda memory & timeout: choose minimal values meeting SLA; base memory increments on need (existing pattern 2048 MB, 20s timeout). Justify deviations.
- Use structured logs and avoid excessive log volume.

## 10. Operational UX (Error Visibility)
- Maintain `ErrorSummary` at top of forms for validation errors.
- Ensure buttons use design system and prevent double clicks (`preventDoubleClick`, `debounceTimeout`).
- Provide descriptive link text; avoid "click here".

## 11. Security & Quality Gates
Run before declaring agent work complete:
```bash
npm run typecheck
npm run lint
npm run test:unit
# (Run accessibility tests if applicable) npm run test:accessibility
# Terraform (in infra dir)
terraform fmt -recursive
terraform validate
# Optional: run gitleaks
gitleaks detect --config scripts/config/gitleaks.toml --redact
```
If adding Docker changes: run hadolint with repo config; run trivy for image scanning if image is built.

<!-- PR workflow intentionally omitted; handled externally by humans. -->

## 12. Examples (Terraform)
### 17.1 Adding a New Lambda Module (Terraform Snippet)
```hcl
module "archive_template_lambda" {
  source                    = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.22/terraform-lambda.zip"
  project                   = var.project
  environment               = var.environment
  component                 = var.component
  aws_account_id            = var.aws_account_id
  region                    = var.region
  kms_key_arn               = var.kms_key_arn
  function_name             = "archive-template"
  function_module_name      = "archive"
  handler_function_name     = "handler"
  description               = "Archive template API endpoint"
  memory                    = 512
  timeout                   = 10
  runtime                   = "nodejs20.x"
  log_retention_in_days     = var.log_retention_in_days
  iam_policy_document = {
    body = data.aws_iam_policy_document.archive_template_lambda_policy.json
  }
  lambda_env_vars           = local.backend_lambda_environment_variables
  function_s3_bucket        = var.function_s3_bucket
  function_code_base_path   = local.lambdas_dir
  function_code_dir         = "backend-api/dist/archive"
  send_to_firehose          = var.send_to_firehose
  log_destination_arn       = var.log_destination_arn
  log_subscription_role_arn = var.log_subscription_role_arn
}
```

### 13.2 DynamoDB Table Pattern
```hcl
resource "aws_dynamodb_table" "routing_configuration" {
  name         = "${local.csi}-routing-configuration"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "owner"
  range_key    = "id"
  attribute { name = "owner" type = "S" }
  attribute { name = "id"    type = "S" }
  ttl { attribute_name = "ttl" enabled = true }
  point_in_time_recovery { enabled = true }
  server_side_encryption { enabled = true kms_key_arn = var.kms_key_arn }
  tags = { "NHSE-Enable-Dynamo-Backup" = var.enable_backup ? "True" : "False" }
  lifecycle { ignore_changes = [name] } # supports backup & restore name changes
  global_secondary_index {
    name            = "QueryById"
    hash_key        = "id"
    projection_type = "KEYS_ONLY"
  }
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"
}
```

### 13.3 EventBridge Pipe Pattern
```hcl
resource "aws_pipes_pipe" "template_table_events" {
  name          = "${local.csi}-template-table-events"
  role_arn      = aws_iam_role.pipe_template_table_events.arn
  source        = aws_dynamodb_table.templates.stream_arn
  target        = module.sqs_template_mgmt_events.sqs_queue_arn
  desired_state = "RUNNING"
  kms_key_identifier = var.kms_key_arn
  source_parameters { dynamodb_stream_parameters { starting_position = "TRIM_HORIZON" on_partial_batch_item_failure = "AUTOMATIC_BISECT" batch_size = 10 maximum_batching_window_in_seconds = 5 maximum_retry_attempts = 5 maximum_record_age_in_seconds = -1 dead_letter_config { arn = module.sqs_template_table_events_pipe_dlq.sqs_queue_arn } } }
  target_parameters {
    input_template = <<-EOF
      {"dynamodb": <$.dynamodb>, "eventID": <$.eventID>, "eventName": <$.eventName>, "tableName": "${aws_dynamodb_table.templates.name}"}
    EOF
    sqs_queue_parameters { message_group_id = "$.dynamodb.Keys.id.S" message_deduplication_id = "$.eventID" }
  }
  log_configuration { level = "ERROR" include_execution_data = ["ALL"] cloudwatch_logs_log_destination { log_group_arn = aws_cloudwatch_log_group.pipe_template_table_events.arn } }
}
```

### 13.4 IAM Policy Snippet (Granular Actions)
```hcl
data "aws_iam_policy_document" "upload_letter_template_lambda_policy" {
  statement {
    sid    = "AllowDynamoAccess"
    effect = "Allow"
    actions = ["dynamodb:PutItem", "dynamodb:UpdateItem"]
    resources = [aws_dynamodb_table.templates.arn]
  }
  statement {
    sid    = "AllowS3Access"
    effect = "Allow"
    actions = ["s3:PutObject"]
    resources = ["${module.s3bucket_quarantine.arn}/pdf-template/*"]
  }
  statement {
    sid    = "AllowKMSAccess"
    effect = "Allow"
    actions = ["kms:Decrypt", "kms:Encrypt", "kms:GenerateDataKey*"]
    resources = [var.kms_key_arn]
  }
}
```

## 13. Future Enhancements
- Automated style linting for Terraform (tflint) integration.
- Expand accessibility test coverage guidelines.
- Add performance budgets & profiling instructions.

---
## 14. Agent Conduct Recap
- Be transparent: annotate non-obvious choices.
- Be conservative: avoid speculative refactors.
- Be helpful: suggest upstream module reuse when clear duplication exists.

If uncertain, prefer asking for clarification via PR comments rather than making broad assumptions.

---
## 15. Changelog
- v0.7 (Removed PR workflow) – Eliminated PR-specific steps & checklist; agent stops at validated code handover.
- v0.6 (Human branch creation) – Agent no longer responsible for branch creation; clarified pre/post engagement duties.
- v0.5 (Handover Model) – Clarified agent vs human responsibilities; PR checklist retitled for human reviewer.
- v0.4 (Formatting & Naming Integration) – Added indentation, alignment, naming hierarchy, security group rule patterns, module usage limits, default tags, conditional logic best practices.
- v0.3 (Terraform-only) – Removed TypeScript content; renumbered sections; added DynamoDB, Pipes, IAM examples.
- v0.2 (Refinement) – Added detailed Terraform conventions (naming, DynamoDB, Pipes, IAM, encryption, SSM, optional resources).
- v0.1 (Initial draft) – Mixed Terraform & TypeScript style, workflow, security, testing.

---
## 16. TypeScript Style & Ways of Working (Reintroduced)

This section defines conventions for TypeScript across Lambdas, shared packages and the Next.js frontend. It complements Terraform guidance (security, determinism, least privilege) with code-level consistency, testability and readability. Follow these unless a strong, documented reason exists (`// agent: rationale <brief>`).

### 16.1 Project Structure & Module Boundaries
- Lambdas: each function lives in its own top-level folder under `lambdas/<function-name>` with `src/`, `__tests__/` and a build script (`build.sh` using `esbuild`). Distribution output in `dist/` only.
- Backend API lambda functions use a pattern: thin entry file (`create.ts`) delegating to an API handler (`templates/api/create.ts`) created by a factory function. Example:
  ```ts
  // lambdas/backend-api/src/templates/create.ts
  export const handler = createHandler(templatesContainer());
  ```
- Domain logic separated from transport (e.g. `api/` vs `app/` vs `domain/`). Keep handler composition pure and injectable.
- Shared packages (e.g. `packages/event-schemas`) expose `index.ts` that re-exports leaf modules for concise imports.

### 16.2 Naming Conventions
- Filenames: kebab-case (`queue-csv-writer.ts`, `event-envelope.ts`).
- Exported constants / functions: camelCase; types & interfaces: PascalCase (`TemplateClient`, `NHSNotifyEventEnvelope`).
- Handler exports: always named `handler` for AWS integration.
- Zod schemas prefixed with `$` (`$TemplateDraftedEventV1`) to distinguish runtime validators from types.
- Suffix factory functions with `create` or `make` (`createHandler`, `makeSQSRecord`).

### 16.3 Imports Ordering
1. Node built-ins (`node:crypto`, `node:stream`).
2. External packages (`zod`, `winston`, `@aws-sdk/...`).
3. Internal absolute aliases (e.g. `@utils/...`).
4. Relative local modules (`./container`, `../domain/...`).
Separate groups with a blank line; avoid unused imports.

### 16.4 Types vs Interfaces
- Prefer `type` aliases when composing (unions/intersections) and `interface` when extending object shapes over time. Current codebase leans toward `type` & Zod inference (`z.infer<typeof $Schema>`). Remain consistent: if Zod is used, generate types via `z.infer`.

### 16.5 Runtime Validation & Schema Design
- Use Zod for all external input (SQS body, EventBridge events, API payloads).
- Keep validation at the boundary: parse early (`$PublishableEventRecord.parse(sqsRecord)` in SQS handlers) then pass typed objects internally.
- Include `.meta({ id: '...' })` for schema identification and documentation.
- Compose schemas via `.extend`, `.intersection`, `.omit`, `.exclude` rather than manually re-declaring fields.
#### Examples
```ts
// packages/event-schemas/src/event-envelope.ts
const $CloudEvent = z.object({
  id: z.string().max(1000),
  time: z.string().regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/),
  type: z.string(),
  source: z.string(),
  specversion: z.literal('1.0'),
  datacontenttype: z.literal('application/json'),
  subject: z.uuid(),
  dataschema: z.url(),
});

export const $NHSNotifyEventEnvelope = $CloudEvent.extend({
  dataschemaversion: z.string(),
  plane: z.enum(['data','control']),
});

// Intersection + exclusion (template-drafted event)
const $TemplateDraftedEventV1Data = z.intersection(
  $TemplateEventV1Data,
  z.object({ templateStatus: $TemplateStatus.exclude(['SUBMITTED','DELETED']) })
);
```
```ts
// Runtime env parsing (backend-api/src/templates/infra/config.ts)
const $Env = z.object({
  CLIENT_CONFIG_SSM_KEY_PREFIX: z.string(),
  CLIENT_CONFIG_TTL_SECONDS: z.string().pipe(z.coerce.number()),
  SUPPLIER_RECIPIENT_EMAIL_ADDRESSES: z.string(),
  // ... trimmed for brevity
});
const env = $Env.parse(process.env);
const supplierRecipientEmailAddresses = z
  .record(z.string(), z.array(z.string().email()))
  .parse(JSON.parse(env.SUPPLIER_RECIPIENT_EMAIL_ADDRESSES));
```

### 16.6 Error Handling Patterns
- Return structured API errors using helpers (`apiFailure`) with statusCode, technical message, optional details.
- Avoid throwing for expected validation failures in Lambdas responding to API Gateway; instead return an appropriate failure response.
- For batch SQS processing: validate each record, skip or DLQ unprocessable payloads. (Future enhancement: add partial failure reporting using `ReportBatchItemFailures` where appropriate.)
#### Examples
```ts
// backend-api/src/templates/api/create.ts
if (!userId || !clientId) {
  return apiFailure(400,'Invalid request');
}
const { data, error } = await templateClient.createTemplate(dto,{ userId, clientId });
if (error) {
  return apiFailure(error.errorMeta.code, error.errorMeta.description, error.errorMeta.details);
}
return apiSuccess(201, data);
```
```ts
// event-publisher/src/apis/sqs-handler.ts
for (const record of event.Records) {
  const sqsRecord: unknown = JSON.parse(record.body);
  const publishableEventRecord = $PublishableEventRecord.parse(sqsRecord); // throws if invalid
  await app.publishEvent(publishableEventRecord);
}
```

### 16.7 Environment Variables & Configuration
- Read env vars once at module top only if cheap/pure; otherwise inside handler for testability.
- Validate presence (`if (!bucket) throw new Error('EVENT_CSV_BUCKET_NAME not set')`). For optional values use fallback helpers.
- Never parse complex configuration without validation; define a Zod object for grouped env vars if >3 related keys.
#### Examples
```ts
// event-publisher/src/container.ts
const { EVENT_SOURCE, ROUTING_CONFIG_TABLE_NAME, SNS_TOPIC_ARN, TEMPLATES_TABLE_NAME } = loadConfig();
// values now validated via loadConfig()
```
```ts
// backend-api/src/templates/infra/config.ts (coercion + nested parse)
CLIENT_CONFIG_TTL_SECONDS: z.string().pipe(z.coerce.number());
```

### 16.8 Functional Composition & Dependency Injection
- Use factory functions returning handlers (`createHandler({ app })`) to allow easy test substitution.
- Containers provide constructed dependencies (e.g. `templatesContainer()`, `createContainer()`); keep container pure and side-effect free except client instantiation.
- Avoid singletons except when mandated by AWS SDK performance; prefer passing pre-configured clients through containers.
#### Examples
```ts
// event-publisher/src/container.ts
const snsClient = new SNSClient({ region: 'eu-west-2' });
const snsRepository = new SNSRepository(snsClient, SNS_TOPIC_ARN);
const eventBuilder = new EventBuilder(TEMPLATES_TABLE_NAME, ROUTING_CONFIG_TABLE_NAME, EVENT_SOURCE, logger);
const app = new App(snsRepository, eventBuilder, logger);
return { app }; // dependency graph returned for injection
```
```ts
// backend-api/src/templates/create.ts
export const handler = createHandler(templatesContainer());
```

### 16.9 CSV / Data Processing Guidance
- Build deterministic headers from union of keys across all rows, sorted alphabetically.
- Escape per RFC4180: replace quotes with doubled quotes, wrap fields containing commas, quotes or newlines in quotes.
- Keep transformation functions (`buildCsv`, `escapeCsv`) pure and export for tests under a `_test` object or explicit named exports.

### 16.10 Testing Conventions
- Use Jest (`@swc/jest` + `esbuild` bundling) with `baseJestConfig` from `nhs-notify-web-template-management-utils`.
- Structure: colocated `__tests__` folder; test file names `<name>.test.ts`.
- Mock AWS SDK v3 clients by replacing `send` with a Jest mock (`jest.mock('@aws-sdk/client-s3', () => ({ S3Client: jest.fn().mockImplementation(() => ({ send: jest.fn() })) }))`).
- Use helper factories from `test-helper-utils` (`makeSQSRecord`, `createMockLogger`) instead of ad-hoc fixtures.
- Assert response shapes not implementation details; prefer `expect(result.statusCode).toBe(201)` over inspecting private fields.
#### Examples
```ts
// backend-api/src/__tests__/templates/api/create.test.ts (pattern similar across tests)
expect(result.statusCode).toBe(201);
expect(JSON.parse(result.body).data.id).toBeDefined();
```
```ts
// test-helper-utils/src/mock-logger.ts (logger utility reused across tests)
const { logger, logMessages } = createMockLogger();
```
```ts
// test-helper-utils/src/aws-events.ts (factory for SQS records)
export const makeSQSRecord = (record: MakeSQSRecordParams): SQSRecord => ({
  messageId: randomUUID(),
  // ... trimmed for brevity
  ...record,
});
```

### 16.11 Async & Promise Handling
- Use `async/await`; avoid mixing `.then` chains.
- Batch handlers (SQS/EventBridge) iterate with `for...of` to preserve sequential semantics when order matters; consider `Promise.all` only when operations are independent and concurrency safe.

### 16.12 Logging
- Use structured logging via `winston`; in tests create an in-memory stream (`createMockLogger`) capturing JSON lines.
- Log contextual identifiers (templateId, clientId) not entire payloads to avoid PII leakage.
#### Examples
```ts
// event-publisher/src/container.ts
new EventBuilder(TEMPLATES_TABLE_NAME, ROUTING_CONFIG_TABLE_NAME, EVENT_SOURCE, logger);
```
```ts
// test-helper-utils/src/mock-logger.ts
transports: [ new winston.transports.Stream({ stream: new Writable({ write: (msg,_,cb)=>{ logMessages.push(JSON.parse(msg)); cb(); } }) }) ]
```

### 16.13 Security & PII
- Never log secrets or raw payloads containing personal data. Redact or summarize counts.
- Enforce CSP construction centrally (see `frontend/src/middleware.ts` example) – dynamic nonce generation, conditional inclusion of `'unsafe-eval'` only in development.
#### Example
```ts
// frontend/src/middleware.ts
const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
requestHeaders.set('Content-Security-Policy', getContentSecurityPolicy(nonce));
```

### 16.14 Performance & Memory
- Default Lambda memory: 512 MB for light transformations; 2048 MB for heavy operations (conversion, PDF processing). Document deviations with comment.
- Avoid unnecessary JSON stringify/parse cycles; parse once then operate on typed object.

### 16.15 Code Formatting & Lint
- Use ESLint with TypeScript; auto-fix where trivial. Keep max line length (inherit repo config).
- Single quotes, semicolons mandatory (per existing code).
- Trailing commas allowed in multi-line structures for diff friendliness.
#### Examples
```ts
// Consistent trailing commas in object literals & arrays
const obj = {
  a: 1,
  b: 'x',
};
const arr = [
  'a',
  'b',
];
```

### 16.16 Export Strategy
- Prefer explicit named exports; only use `export *` at index barrel layers.
- Do not overwrite `module.exports`; maintain ESM style.

### 16.17 Utility Patterns
- Put small pure utilities directly in the function file if used once; extract to `utils/` when reused by >2 handlers.
- Group regex patterns or security policies (e.g. arrays of protected routes) at top-level constants; annotate purpose.

### 16.18 Testing Edge Cases (Recommended Minimum)
For each handler include tests for:
- Happy path.
- Missing/invalid auth or env prerequisites.
- Validation failure (schema parse error) – ensure graceful handling.
- Empty batch (SQS) producing no-op result.

### 16.19 Error Object Shape
- Standardized failure JSON: `{ statusCode, technicalMessage, details? }` matching `Failure` type from backend client.
- Avoid exposing internal stack traces or AWS request IDs to external callers.

### 16.20 Schema Versioning
- Versioned events: enforce `dataschemaversion` prefix constraints (e.g. `.startsWith('1.')`).
- Use semantic versioning in schema URLs; keep backwards compatibility by extending new schemas rather than mutating existing ones.

### 16.21 Comment Standards
- Use leading `//` for brief notes; block comments reserved for multi-line protocol references.
- Provide links to external specs (as seen in `event-envelope.ts`) when implementing standards.
#### Example
```ts
// packages/event-schemas/src/event-envelope.ts
// https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/formats/json-format.md
```

### 16.22 Future Enhancements (TS)
- Add runtime feature flags via validated env schema.
- Introduce performance profiling harness for high-throughput handlers.
- Expand partial failure reporting for SQS batch handlers.

## 17. Changelog (Updated)
- v0.8.1 (TS guide expansion) – Added concrete examples (schema composition, dependency injection, env parsing, logging, tests, CSP) for clearer adoption.
- v0.8 (Reintroduced TS style) – Added comprehensive TypeScript style & ways-of-working section (#16) covering naming, validation, testing, logging & security.
- v0.7 (Removed PR workflow) – Eliminated PR-specific steps & checklist; agent stops at validated code handover.
- v0.6 (Human branch creation) – Agent no longer responsible for branch creation; clarified pre/post engagement duties.
- v0.5 (Handover Model) – Clarified agent vs human responsibilities; PR checklist retitled for human reviewer.
- v0.4 (Formatting & Naming Integration) – Added indentation, alignment, naming hierarchy, security group rule patterns, module usage limits, default tags, conditional logic best practices.
- v0.3 (Terraform-only) – Removed TypeScript content; renumbered sections; added DynamoDB, Pipes, IAM examples.
- v0.2 (Refinement) – Added detailed Terraform conventions (naming, DynamoDB, Pipes, IAM, encryption, SSM, optional resources).
- v0.1 (Initial draft) – Mixed Terraform & TypeScript style, workflow, security, testing.
