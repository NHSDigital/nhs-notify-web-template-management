module "sftp_upload_queue" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/sqs?ref=80b61143ffd21251b6e13eb5ea154fbc0e74b1b8"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  name           = "sftp-upload"

  sqs_kms_key_arn = var.kms_key_arn

  create_dlq = true
}
