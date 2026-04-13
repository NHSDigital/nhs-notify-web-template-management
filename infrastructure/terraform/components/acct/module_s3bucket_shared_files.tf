module "s3bucket_shared_files" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/3.0.8/terraform-s3bucket.zip"

  name = "shared-files"

  aws_account_id = var.aws_account_id
  region         = var.region
  project        = var.project
  environment    = var.environment
  component      = var.component

  bucket_logging_target = {
    bucket = module.s3bucket_access_logs.id
  }
}
