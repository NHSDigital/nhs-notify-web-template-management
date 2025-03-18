module "sqs_tags_added" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/sqs?ref=v1.0.8"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  name           = "tags-added"

  sqs_kms_key_arn = var.kms_key_arn

  create_dlq = true

  sqs_policy_overload = data.aws_iam_policy_document.sqs_tags_added.json
}


data "aws_iam_policy_document" "sqs_tags_added" {
  version = "2012-10-17"

  statement {
    effect  = "Allow"
    actions = ["SQS:SendMessage"]

    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }

    resources = [module.sqs_tags_added.sqs_queue_arn]
  }
}
