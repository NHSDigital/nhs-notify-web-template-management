module "s3bucket_event_csv" {
  source        = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-s3bucket.zip"

  name          = "event-csv" # agent: rationale separate bucket for CSV artifacts to isolate access pattern from template internal/quarantine buckets

  aws_account_id = var.aws_account_id
  region          = var.region
  project         = var.project
  environment     = var.environment
  component       = var.component

  kms_key_arn     = module.kms.key_arn
}
