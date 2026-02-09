module "kms_ecr" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-kms.zip"
  providers = {
    aws           = aws
    aws.us-east-1 = aws.us-east-1
  }

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region

  name                 = "ecr"
  deletion_window      = var.kms_deletion_window
  alias                = "alias/${local.csi}-ecr"
  key_policy_documents = [data.aws_iam_policy_document.kms.json]
  iam_delegation       = true
}

data "aws_iam_policy_document" "kms" {
  # '*' resource scope is permitted in access policies as as the resource is itself
  # https://docs.aws.amazon.com/kms/latest/developerguide/key-policy-services.html

  statement {
    sid    = "AllowEcr"
    effect = "Allow"

    principals {
      type = "Service"

      identifiers = [
        "ecr.amazonaws.com"
      ]
    }

    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey"
    ]

    resources = [
      "*",
    ]

    condition {
      test     = "StringEquals"
      variable = "kms:EncryptionContext:aws:ecr:repositoryArn"

      values = [
        "arn:aws:ecr:${var.region}:${var.aws_account_id}:repository/${local.csi}-ecr",      ]
    }
  }
}
