module "sqs_event_csv" {
  source         = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-sqs.zip"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  name           = "event-csv"
  fifo_queue     = true      # agent: rationale ordering guarantees deterministic header aggregation & easier replay
  sqs_kms_key_arn= module.kms.key_arn
  create_dlq     = true      # agent: rationale poison message isolation for malformed JSON
}
