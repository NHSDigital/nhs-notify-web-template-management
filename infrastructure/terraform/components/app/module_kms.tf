module "kms" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/kms?ref=v1.0.8"

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
    sid    = "AllowCloudWatchEncrypt"
    effect = "Allow"

    principals {
      type = "Service"

      identifiers = [
        "logs.${var.region}.amazonaws.com",
        "sns.amazonaws.com",
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
    sid    = "AllowCloudFrontServicePrincipalSSE-KMS"
    effect = "Allow"

    principals {
      type = "Service"

      identifiers = [
        "cloudfront.amazonaws.com",
      ]
    }

    actions = [
      "kms:Decrypt",
      "kms:Encrypt",
      "kms:GenerateDataKey*"
    ]

    resources = [
      "*",
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"

      values = [
        aws_cloudfront_distribution.main.arn,
      ]
    }
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
      test     = "ArnEquals"
      variable = "kms:EncryptionContext:aws:sqs:arn"
      values = [
        module.backend_api.letter_file_validation_queue_arn
      ]
    }

    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values = [
        module.backend_api.upload_scan_passed_rule_arn
      ]
    }
  }
}
