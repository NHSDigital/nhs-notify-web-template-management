module "s3bucket_internal" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/3.0.4/terraform-s3bucket.zip"

  name = "internal"

  aws_account_id = var.aws_account_id
  region         = var.region
  project        = var.project
  environment    = var.environment
  component      = var.component

  kms_key_arn = var.kms_key_arn

  notification_events = {
    eventbridge = true
  }

  bucket_logging_target = {
    bucket = "${var.access_logging_bucket}"
  }
}
