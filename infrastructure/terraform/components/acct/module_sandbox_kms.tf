module "kms_sandbox" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/kms?ref=v1.0.8"

  count = var.support_sandbox_environments ? 1 : 0

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region

  name            = "sandbox"
  deletion_window = var.kms_deletion_window
  alias           = "alias/${local.csi}-sandbox"
  iam_delegation  = true

  key_policy_documents = [data.aws_iam_policy_document.kms.json]
}

data "aws_iam_policy_document" "kms" {
  # '*' resource scope is permitted in access policies as as the resource is itself
  # https://docs.aws.amazon.com/kms/latest/developerguide/key-policy-services.html

  statement {
    sid    = "AllowCloudWatchEncrypt"
    effect = "Allow"

    principals {
      type = "Service"

      identifiers = [
        "logs.${var.region}.amazonaws.com",
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

    condition {
      test     = "ArnLike"
      variable = "kms:EncryptionContext:aws:logs:arn"

      values = [
        "arn:aws:logs:${var.region}:${var.aws_account_id}:log-group:*",
      ]
    }
  }

  statement {
    sid    = "AllowS3"
    effect = "Allow"

    principals {
      type = "Service"

      identifiers = [
        "s3.amazonaws.com",
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

  statement {
    sid    = "AllowSES"
    effect = "Allow"

    principals {
      type = "Service"

      identifiers = [
        "ses.amazonaws.com",
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

  statement {
    sid    = "AllowLogDeliveryEncrypt"
    effect = "Allow"

    principals {
      type = "Service"

      identifiers = [
        "delivery.logs.amazonaws.com"
      ]
    }

    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey*",
    ]

    resources = [
      "*",
    ]

    condition {
      test     = "StringLike"
      variable = "kms:EncryptionContext:SourceArn"

      values = [
        "arn:aws:logs:${var.region}:${var.aws_account_id}:*",
      ]
    }
  }

  statement {
    sid    = "AllowEventBridgeAccessToLetterValidationQueue"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }

    actions = [
      "kms:GenerateDataKey*",
      "kms:Decrypt",
    ]

    resources = ["*"]

    condition {
      test     = "ArnLike"
      variable = "kms:EncryptionContext:aws:sqs:arn"
      values   = ["arn:aws:sqs:${var.region}:${var.aws_account_id}:*-validate-letter-template-files-queue"]
    }

    condition {
      test     = "ArnLike"
      variable = "aws:SourceArn"
      values   = ["arn:aws:events:${var.region}:${var.aws_account_id}:rule/*-quarantine-scan-passed-for-upload"]
    }
  }
}
