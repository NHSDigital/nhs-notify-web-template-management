module "sqs_template_table_events_pipe_dlq" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.28/terraform-sqs.zip"

  aws_account_id            = var.aws_account_id
  component                 = var.component
  environment               = var.environment
  project                   = var.project
  region                    = var.region
  name                      = "template-table-events-pipe-dead-letter"
  sqs_kms_key_arn           = var.kms_key_arn
  message_retention_seconds = 1209600
}
