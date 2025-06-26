module "sqs_scan_failed_delete_dlq" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/sqs?ref=v2.0.8"

  aws_account_id  = var.aws_account_id
  component       = var.component
  environment     = var.environment
  project         = var.project
  region          = var.region
  name            = "scan-failed-delete"
  sqs_kms_key_arn = var.kms_key_arn

  sqs_policy_overload = data.aws_iam_policy_document.events_dlq.json
}
