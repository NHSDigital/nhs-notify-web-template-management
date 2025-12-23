module "sqs_template_mgmt_events" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.28/terraform-sqs.zip"

  aws_account_id  = var.aws_account_id
  component       = var.component
  environment     = var.environment
  project         = var.project
  region          = var.region
  name            = "template-mgmt-events"
  fifo_queue      = true
  sqs_kms_key_arn = var.kms_key_arn
  create_dlq      = true
}
