module "sqs_data_export" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-sqs.zip"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  name           = "data-export"

  sqs_kms_key_arn = var.kms_key_arn

  visibility_timeout_seconds = 60

  create_dlq = true
}
