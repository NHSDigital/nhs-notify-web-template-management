module "s3bucket_shared_files" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/3.0.8/terraform-s3bucket.zip"

  name = "shared-files"

  aws_account_id = var.aws_account_id
  region         = var.region
  project        = var.project
  environment    = var.environment
  component      = var.component

  policy_documents = [
    data.aws_iam_policy_document.shared_files_bucket_policy.json
  ]

  bucket_logging_target = {
    bucket = module.s3bucket_access_logs.id
  }

  kms_key_arn = module.kms.key_arn
}

data "aws_iam_policy_document" "shared_files_bucket_policy" {

  statement {
    sid    = "AllowCoreAccount"
    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:GetObjectTagging",
      "s3:ListBucket",
    ]

    resources = [
      module.s3bucket_shared_files.arn,
      "${module.s3bucket_shared_files.arn}/*",
    ]

    principals {
      type = "AWS"

      identifiers = var.shared_files_bucket_allowlist
    }
  }
}
