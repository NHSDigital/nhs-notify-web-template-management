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

  key_policy_documents = [
    aws_iam_policy_document.kms
  ]
}

data "aws_iam_policy_document" "kms" {
  # '*' resource scope is permitted in access policies as as the resource is itself
  # https://docs.aws.amazon.com/kms/latest/developerguide/key-policy-services.html

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
        module.backend_api.cloudfront_distribution_arn
      ]
    }
  }
}
