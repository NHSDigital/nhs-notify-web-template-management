module "s3bucket_pdf_template_quarantine" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/s3bucket?ref=v1.0.8"

  name = "quarantine"

  aws_account_id = var.aws_account_id
  region         = var.region
  project        = var.project
  environment    = var.environment
  component      = var.component

  kms_key_arn = aws_kms_key.s3.arn

  versioning = false

  lifecycle_rules = [
    {
      enabled = true

      expiration = {
        days = 1
      }
    }
  ]

  notification_events = {
    eventbridge = true
  }

  policy_documents = [
    data.aws_iam_policy_document.s3bucket_pdf_template_quarantine.json
  ]

  default_tags = {
    Name = "Quarantine for files pending virus scan"
  }
}

data "aws_iam_policy_document" "s3bucket_pdf_template_quarantine" {
  statement {
    effect  = "Deny"
    actions = ["s3:*"]
    resources = [
      module.s3bucket_pdf_template_quarantine.arn,
      "${module.s3bucket_pdf_template_quarantine.arn}/*",
    ]
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values = [
        false
      ]
    }
  }
}
