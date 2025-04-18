module "sftp_upload_queue" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/sqs?ref=v1.0.8"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  name           = "sftp-upload"

  sqs_kms_key_arn = var.kms_key_arn

  create_dlq = true
}
