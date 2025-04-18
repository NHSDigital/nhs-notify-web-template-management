module "sqs_virus_scan_passed_copy_object_dlq" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/sqs?ref=v1.0.8"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  name           = "virus-scan-passed-copy-object-dlq"

  sqs_kms_key_arn = var.kms_key_arn
}
