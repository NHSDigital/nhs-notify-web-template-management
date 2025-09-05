module "s3bucket_download" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-s3bucket.zip"

  name = "download"

  aws_account_id = var.aws_account_id
  region         = var.region
  project        = var.project
  environment    = var.environment
  component      = var.component

  kms_key_arn = var.kms_key_arn

  policy_documents = [data.aws_iam_policy_document.s3bucket_download.json]
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

      resources = ["${module.s3bucket_download.arn}/*"]

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
