module "s3bucket_quarantine" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/3.1.0/terraform-s3bucket.zip"

  name = "quarantine"

  aws_account_id = var.aws_account_id
  region         = var.region
  project        = var.project
  environment    = var.environment
  component      = var.component

  bucket_logging_target = {
    bucket = module.s3bucket_access_logs.id
  }

  kms_key_arn = module.kms.key_arn

  notification_events = {
    eventbridge = true
  }

  lifecycle_rules = [
    {
      enabled = true

      expiration = {
        days = 1
      }
    }
  ]
}
