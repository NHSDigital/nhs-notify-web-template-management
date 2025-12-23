module "sqs_validate_letter_template_files" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.27/terraform-sqs.zip"

  aws_account_id             = var.aws_account_id
  component                  = var.component
  environment                = var.environment
  project                    = var.project
  region                     = var.region
  name                       = "validate-letter-template-files"
  create_dlq                 = true
  visibility_timeout_seconds = 10
  delay_seconds              = 2

  sqs_kms_key_arn = var.kms_key_arn

  sqs_policy_overload = data.aws_iam_policy_document.eventbridge_sqs_validation_queue.json
}

data "aws_iam_policy_document" "eventbridge_sqs_validation_queue" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }
    actions   = ["sqs:SendMessage"]
    resources = [module.sqs_validate_letter_template_files.sqs_queue_arn]

    condition {
      test     = "ArnEquals"
      variable = "aws:SourceArn"
      values = [
        aws_cloudwatch_event_rule.guardduty_quarantine_scan_passed_for_upload.arn
      ]
    }
  }
}
