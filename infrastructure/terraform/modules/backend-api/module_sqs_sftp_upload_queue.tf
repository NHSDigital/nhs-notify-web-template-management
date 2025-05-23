module "sqs_sftp_upload" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/sqs?ref=v2.0.1"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  name           = "sftp-upload"

  sqs_kms_key_arn = var.kms_key_arn

  visibility_timeout_seconds = 60

  create_dlq = true
}
