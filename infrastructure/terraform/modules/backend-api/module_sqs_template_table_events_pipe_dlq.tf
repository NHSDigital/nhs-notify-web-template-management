module "sqs_template_table_events_pipe_dlq" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/sqs?ref=v2.0.8"

  aws_account_id  = var.aws_account_id
  component       = var.component
  environment     = var.environment
  project         = var.project
  region          = var.region
  name            = "template-table-events-pipe-dead-letter"
  sqs_kms_key_arn = var.kms_key_arn
}
