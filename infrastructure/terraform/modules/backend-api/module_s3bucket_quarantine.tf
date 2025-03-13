module "s3bucket_pdf_template_quarantine" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/s3bucket?ref=v1.0.8"

  name = "quarantine"

  aws_account_id = var.aws_account_id
  region         = var.region
  project        = var.project
  environment    = var.environment
  component      = var.component

  kms_key_arn = var.shared_kms_key_arn

  versioning = false

  lifecycle_rules = [
    {
      enabled = true

      expiration = {
        days = 1
      }
    }
  ]

  default_tags = {
    Name = "Quarantine for files pending virus scan"
  }
}
