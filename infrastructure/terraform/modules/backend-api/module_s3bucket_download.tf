module "s3bucket_download" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/s3bucket?ref=v2.0.2"

  name = "download"

  aws_account_id = var.aws_account_id
  region         = var.region
  project        = var.project
  environment    = var.environment
  component      = var.component

  kms_key_arn = var.kms_key_arn

  policy_documents = [data.aws_iam_policy_document.s3bucket_download.json]

  public_access = {
    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
  }
}

data "aws_iam_policy_document" "s3bucket_download" {
  dynamic "statement" {
    for_each = var.cloudfront_distribution_arn != null ? [1] : []

    content {
      sid    = "AllowCloudFrontServicePrincipalReadOnly"
      effect = "Allow"

      actions = [
        "s3:GetObject",
      ]

      resources = [
        module.s3bucket_download.arn,
        "${module.s3bucket_download.arn}/*",
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
}
