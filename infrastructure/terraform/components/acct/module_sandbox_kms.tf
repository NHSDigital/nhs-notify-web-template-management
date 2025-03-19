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
  # key_policy_documents = [data.aws_iam_policy_document.kms_sandbox.json]
  iam_delegation = true

}

# data "aws_iam_policy_document" "kms_sandbox" {
#   statement {
#     sid    = "AllowEventBridge"
#     effect = "Allow"

#     principals {
#       type = "Service"

#       identifiers = [
#         "events.amazonaws.com",
#       ]
#     }

#     actions = [
#       "kms:Decrypt",
#       "kms:GenerateDataKey",
#     ]

#     resources = [
#       "*",
#     ]
#   }
# }
