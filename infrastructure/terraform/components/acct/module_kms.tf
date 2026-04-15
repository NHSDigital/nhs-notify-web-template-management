module "kms" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/3.0.8/terraform-kms.zip"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region

  name                 = "main"
  deletion_window      = var.kms_deletion_window
  alias                = "alias/${local.csi}"
  key_policy_documents = [data.aws_iam_policy_document.kms.json]
  iam_delegation       = true
}

data "aws_iam_policy_document" "kms" {
  # '*' resource scope is permitted in access policies as as the resource is itself
  # https://docs.aws.amazon.com/kms/latest/developerguide/key-policy-services.html

  statement {
    sid    = "AllowS3"
    effect = "Allow"

    principals {
      type = "AWS"

      identifiers = var.shared_files_bucket_allowlist
    }

    actions = [
      "kms:Decrypt",
      "kms:DescribeKey"
    ]

    resources = [
      "*",
    ]
  }
}
