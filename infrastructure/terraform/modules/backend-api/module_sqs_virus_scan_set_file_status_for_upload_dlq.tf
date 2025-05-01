module "sqs_virus_scan_set_file_status_for_upload_dlq" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/sqs?ref=v2.0.1"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  name           = "virus-scan-set-file-status-for-upload-dlq"

  sqs_kms_key_arn = var.kms_key_arn
}
