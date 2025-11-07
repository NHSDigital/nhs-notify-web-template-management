# Terraform Agents Guide

> Extracted from root `agents.md` – Terraform-specific sections for automated agent usage. TypeScript guidance moved to `lambdas/agents-typescript.md`.

---
## 1. Purpose & Scope
Defines how automated agents should inspect and modify Terraform infrastructure code in `infrastructure/terraform` (root modules & nested modules). Maintain security, least privilege IAM, encryption, determinism, and consistency. Minimise disruption; prefer reuse via shared modules.

## 2. Core Principles
1. Precision over breadth – change only what the ticket requires.
2. Security first – never introduce secrets or broaden IAM unnecessarily.
3. Test before completion (Terraform validation + code tests when Lambda code touched).
4. Consistent naming – match existing patterns.
5. Explain deviations inline with `# agent: rationale` comments (rare & concise).
6. Reusability – prefer shared modules already present before adding new ones.

## 3. Infrastructure Stack Overview
| Area | Tools / Services |
|------|------------------|
| IaC | Terraform (version pinned via `.tool-versions`) |
| AWS | Lambda, API Gateway (REST), DynamoDB, SSM Parameter Store, S3, CloudWatch Logs / Events, SNS, SQS (FIFO w/ DLQ), EventBridge Pipes, GuardDuty Malware Protection |
| Encryption | KMS customer-managed keys (`var.kms_key_arn`) |
| Observability | CloudWatch Logs (retention via `log_retention_in_days`), optional Firehose subscription |
| Security / Scanning | gitleaks, trivy, syft, pre-commit hooks |
| Shared Modules | `nhs-notify-shared-modules` release ZIPs (version-pinned) |

## 4. Workflow Expectations & Handover
Human creates branch (`feature/<JIRA-ID>_<summary>` or `fix/<JIRA-ID>_<summary>`) and supplies ticket context. Agent operates only within that branch.

Agent duties:
1. Implement scoped Terraform changes.
2. Run quality gates (fmt, validate; if Lambda code impacted also run tests via provided scripts).
3. Annotate deviations with `# agent: rationale`.
4. Produce handover summary: changes, files, IAM impact, risks, rollback note.
5. Stop after validated code.

## 5. Commit & Branch Conventions
Branch naming is human responsibility. Commits: `<JIRA-ID> <imperative summary>` (no period). Body optional for rationale.

## 6. Terraform Style Guide (Highlights)
### 6.1 File & Module Structure
One resource/module per file where practical; related collections may share a file (e.g. security group rules).

### 6.2 Naming Conventions
- Locals & variables: snake_case.
- Functions (Lambda names): kebab-case.
- Composite identifiers: `csi = "${var.csi}-${var.module}"` pattern when needed.
- SSM paths: `/${var.csi}/<category>/<key>`.

### 6.3 Modules & Sources
Use version-pinned shared module ZIPs (e.g. `v2.0.22`). Propose upstream additions rather than duplicating patterns.

### 6.4 IAM Policies
Use `data "aws_iam_policy_document"`. Each statement has `sid`, granular actions, explicit resource ARNs. Avoid wildcards.

### 6.5 Environment Variables
Centralise Lambda env vars in local map; uppercase keys; alphabetical insertion where feasible.

### 6.6 Template Files
Use `templatefile()` with explicit variable map.

### 6.7 Outputs
Only what consumers need; no sensitive values.

### 6.8 Formatting & Validation
Run `terraform fmt -recursive` then `terraform validate` before handover.

### 6.9 Version & Providers
Pin versions. Avoid loose `>=` unless required.

### 6.10 DRY & Repetition
Extract recurring ARNs/paths to locals.

### 6.10.1 Indentation & Alignment
2 spaces; align equals signs within contiguous single-line blocks; blank line before multi-line constructs.

### 6.10.2 Ordering & Grouping
Meta params first; identification block; functional params alphabetical; multi-line separated; tags last.

### 6.10.3 Lists & Sets
One value per line with trailing comma.

### 6.10.4 Maps
One key per line; consistent quoting.

### 6.10.5 File Naming
Pattern: `<class>_<type>_<name>.tf`; omit provider prefix where obvious; variables in `variables.tf`; outputs in `outputs.tf`.

### 6.10.6 Object Names
Avoid redundancy; singular `main` for unique resource type.

### 6.10.7 CSI
Keep segments short for downstream resource name limits.

### 6.10.8 Default Tags
Always apply base tags; merge overrides as needed.

### 6.10.9 Security Group Rules
All rules for a SG in `security_group_rules_<group>.tf`. Naming: `<group>_<direction>_<peer>_<service>`.

### 6.10.10 Module Usage
Use modules for reusable blocks only; avoid one-off wrappers.

### 6.10.11 Conditional Logic
Prefer boolean feature flags over environment name checks.

### 6.10.12 Inline vs Attachment
Prefer dedicated resources (e.g. `aws_security_group_rule`) to avoid cyclic dependencies.

### 6.10.13 IAM Policy Construction & Attachment
Managed policies only where necessary; otherwise custom documents; large policy exception justified with comment.

### 6.10.14 Resource Names
Prefix with CSI and concise hyphenated purpose.

### 6.10.15 Load Balancers
Predictable naming; `main` if single LB.

### 6.10.16 Templates & Codec Functions
Use `templatefile`, `jsonencode` etc.

### 6.10.17 Commentary Standards
Sparse; only deviations, lifecycle exceptions, or required rationale.

### 6.11 Resource Naming & Tagging
Consistent `${local.csi}-<purpose>`; boolean tags as `"True"/"False"`.

### 6.12 DynamoDB Tables
`PAY_PER_REQUEST`; enable TTL, PITR, SSE (KMS); streams when needed; minimal GSIs; lifecycle ignore name for restore workflows.

### 6.13 SSM Parameters
Hierarchical names; `SecureString` for credential-like; lifecycle ignore value for external rotation.

### 6.14 Optional / Conditional Resources
Use `count` for single optional, `for_each` for multiple; wrap external refs with `try()`.

### 6.15 CloudWatch Event Rules & Targets
Structured `event_pattern` via `jsonencode`; separate rule and target resources.

### 6.16 EventBridge Pipes
`desired_state = "RUNNING"`; `starting_position = "TRIM_HORIZON"`; failure handling config; deterministic grouping/dedup; error-level logging.

### 6.17 Lambda Module Configuration
Memory/timeouts sized by workload; ordering of parameters consistent; DLQ/notifications gated via explicit flags.

### 6.18 IAM Policy Authoring
Granular Dynamo, S3 object-level, limited KMS actions, explicit service trusts.

### 6.19 Encryption & KMS Patterns
Use customer-managed key; limit KMS actions to encrypt/decrypt/data key operations.

### 6.20 Secure Strings & Secret Rotation
Lifecycle ignore externally rotated secrets; placeholders only.

### 6.21 Comprehensions & Defensive Access
Use inline `for` expressions; `try()` for optional resources.

### 6.22 Comments & Justifications
Only when necessary; format `# agent: rationale <brief>`.

## 7. Infrastructure Security & Compliance
Least privilege IAM; scoped SSM access; minimal Dynamo/S3 actions; log retention set.

## 8. Secrets & Config Management
No committed secrets; fetch from SSM/Secrets Manager; document paths.

## 9. Performance & Observability
Right-size Lambda memory/timeouts; structured logging; avoid noise.

## 10. Operational UX (Error Visibility)
Maintain error summary & design system conventions when provisioning frontend-related infra (if applicable).

## 11. Security & Quality Gates
Before completion:
```bash
terraform fmt -recursive
terraform validate
# (If code touched) npm run typecheck
# (If code touched) npm run lint
# (If code touched) npm run test:unit
```
Optional: gitleaks/trivy/syft scans.

## 12. Examples
### Adding a New Lambda Module
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
  iam_policy_document = { body = data.aws_iam_policy_document.archive_template_lambda_policy.json }
  lambda_env_vars           = local.backend_lambda_environment_variables
  function_s3_bucket        = var.function_s3_bucket
  function_code_base_path   = local.lambdas_dir
  function_code_dir         = "backend-api/dist/archive"
  send_to_firehose          = var.send_to_firehose
  log_destination_arn       = var.log_destination_arn
  log_subscription_role_arn = var.log_subscription_role_arn
}
```

### DynamoDB Table Pattern
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

### EventBridge Pipe Pattern
```hcl
resource "aws_pipes_pipe" "template_table_events" {
  name                = "${local.csi}-template-table-events"
  role_arn            = aws_iam_role.pipe_template_table_events.arn
  source              = aws_dynamodb_table.templates.stream_arn
  target              = module.sqs_template_mgmt_events.sqs_queue_arn
  desired_state       = "RUNNING"
  kms_key_identifier  = var.kms_key_arn

  source_parameters {
    dynamodb_stream_parameters {
      starting_position                 = "TRIM_HORIZON"
      on_partial_batch_item_failure     = "AUTOMATIC_BISECT"
      batch_size                        = 10
      maximum_batching_window_in_seconds= 5
      maximum_retry_attempts            = 5
      maximum_record_age_in_seconds     = -1
      dead_letter_config { arn = module.sqs_template_table_events_pipe_dlq.sqs_queue_arn }
    }
  }

  target_parameters {
    input_template = <<-EOF
      {"dynamodb": <$.dynamodb>, "eventID": <$.eventID>, "eventName": <$.eventName>, "tableName": "${aws_dynamodb_table.templates.name}"}
    EOF
    sqs_queue_parameters {
      message_group_id       = "$.dynamodb.Keys.id.S"
      message_deduplication_id = "$.eventID"
    }
  }

  log_configuration {
    level                  = "ERROR"
    include_execution_data = ["ALL"]
    cloudwatch_logs_log_destination { log_group_arn = aws_cloudwatch_log_group.pipe_template_table_events.arn }
  }
}
```

### IAM Policy Snippet
```hcl
data "aws_iam_policy_document" "upload_letter_template_lambda_policy" {
  statement {
    sid      = "AllowDynamoAccess"
    effect   = "Allow"
    actions  = ["dynamodb:PutItem", "dynamodb:UpdateItem"]
    resources= [aws_dynamodb_table.templates.arn]
  }
  statement {
    sid      = "AllowS3Access"
    effect   = "Allow"
    actions  = ["s3:PutObject"]
    resources= ["${module.s3bucket_quarantine.arn}/pdf-template/*"]
  }
  statement {
    sid      = "AllowKMSAccess"
    effect   = "Allow"
    actions  = ["kms:Decrypt", "kms:Encrypt", "kms:GenerateDataKey*"]
    resources= [var.kms_key_arn]
  }
}
```

## 13. Future Enhancements
- Add Terraform style linting (tflint) integration.
- Expand security scanning automation.

## 14. Agent Conduct Recap
Be transparent, conservative, helpful. Ask for clarification only when blocked.

## 15. Changelog (Terraform Doc)
- Initial split (2025-11-07): Extracted Terraform sections from root `agents.md`.
