module "s3bucket_ses" {
  count = var.use_sftp_letter_supplier_mock ? 1 : 0

  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/s3bucket?ref=v2.0.4"

  name = "ses"

  aws_account_id = var.aws_account_id
  region         = var.region
  project        = var.project
  environment    = var.environment
  component      = var.component

  kms_key_arn = var.kms_key_arn
}
