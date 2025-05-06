module "s3bucket_download" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/s3bucket?ref=v2.0.2"

  name = "download"

  aws_account_id = var.aws_account_id
  region         = var.region
  project        = var.project
  environment    = var.environment
  component      = var.component

  kms_key_arn = var.kms_key_arn

  // source_policy_documents variable to be added here to manage bucket access
  // once we have the cloudfront distribution
}
