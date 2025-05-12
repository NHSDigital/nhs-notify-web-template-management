locals {
  # required to avoid a circular dependency between policy and bucket
  download_bucket_name = "download"
  download_bucket_arn  = "arn:aws:s3:::${local.csi_global}-${download_bucket_name}"
}

module "s3bucket_download" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/s3bucket?ref=v2.0.2"

  name = local.download_bucket_name

  aws_account_id = var.aws_account_id
  region         = var.region
  project        = var.project
  environment    = var.environment
  component      = var.component

  kms_key_arn = var.kms_key_arn

  policy_documents = []

  public_access = {
    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
  }
}

resource "aws_s3_bucket_policy" "download_bucket_policy" {
  count = var.cloudfront_distribution_arn != null ? 1 : 0

  bucket = module.s3bucket_download.id
  policy = data.aws_iam_policy_document.s3bucket_download[0].json
}

data "aws_iam_policy_document" "s3bucket_download" {
  count = var.cloudfront_distribution_arn != null ? 1 : 0

  statement {
    sid    = "AllowCloudFrontServicePrincipalReadOnly"
    effect = "Allow"

    actions = [
      "s3:GetObject",
    ]

    resources = [
      local.download_bucket_arn,
      "${local.download_bucket_arn}/*",
    ]

    principals {
      type = "Service"

      identifiers = [
        "cloudfront.amazonaws.com"
      ]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"

      values = [
        var.cloudfront_distribution_arn,
      ]
    }
  }
}
