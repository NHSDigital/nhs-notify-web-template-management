module "s3bucket_internal" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-s3bucket.zip"

  name = "internal"

  aws_account_id = var.aws_account_id
  region         = var.region
  project        = var.project
  environment    = var.environment
  component      = var.component

  kms_key_arn = var.kms_key_arn
}

resource "aws_s3_bucket_notification" "docx_template_internal" {
  bucket      = aws_s3_bucket.source.id
  eventbridge = true
}
