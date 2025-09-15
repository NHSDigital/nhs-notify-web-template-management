module "kms_us_east_1" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-kms.zip"

  providers = {
    aws           = aws.us-east-1
    aws.us-east-1 = aws.us-east-1
  }

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = "us-east-1"

  name                 = "main"
  deletion_window      = var.kms_deletion_window
  alias                = "alias/${local.csi}"
  key_policy_documents = [data.aws_iam_policy_document.kms_us_east_1.json]
  iam_delegation       = true
}

data "aws_iam_policy_document" "kms_us_east_1" {
  # '*' resource scope is permitted in access policies as as the resource is itself
  # https://docs.aws.amazon.com/kms/latest/developerguide/key-policy-services.html

  statement {
    sid    = "AllowCloudWatchEncrypt"
    effect = "Allow"

    principals {
      type = "Service"

      identifiers = [
        "logs.us-east-1.amazonaws.com",
      ]
    }

    actions = [
      "kms:Encrypt*",
      "kms:Decrypt*",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:Describe*"
    ]

    resources = [
      "*",
    ]
  }
}
