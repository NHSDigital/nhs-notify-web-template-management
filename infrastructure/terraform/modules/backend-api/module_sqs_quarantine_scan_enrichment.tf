module "sqs_quarantine_scan_enrichment" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/sqs?ref=v2.0.1"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  name           = "quarantine-scan-enrichment"

  sqs_kms_key_arn = var.kms_key_arn

  create_dlq = true
}

