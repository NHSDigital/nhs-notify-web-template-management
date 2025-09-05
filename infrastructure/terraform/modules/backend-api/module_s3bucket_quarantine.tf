module "s3bucket_quarantine" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-s3bucket.zip"

  name = "quarantine"

  aws_account_id = var.aws_account_id
  region         = var.region
  project        = var.project
  environment    = var.environment
  component      = var.component

  kms_key_arn = var.kms_key_arn

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
