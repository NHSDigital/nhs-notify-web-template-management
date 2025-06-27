resource "aws_iam_role" "eventbridge_upload_validation_queue" {
  name               = "${local.csi}-quarantine-scan-passed-uploads-sqs"
  assume_role_policy = data.aws_iam_policy_document.events_assume_role.json
}

resource "aws_iam_role_policy" "eventbridge_upload_validation_queue" {
  name   = "${local.csi}-quarantine-scan-passed-for-upload-sqs"
  role   = aws_iam_role.eventbridge_upload_validation_queue.id
  policy = data.aws_iam_policy_document.eventbridge_upload_validation_queue.json
}

data "aws_iam_policy_document" "eventbridge_upload_validation_queue" {
  version = "2012-10-17"

  statement {
    sid       = "AllowSQSSendMessage"
    effect    = "Allow"
    actions   = ["sqs:SendMessage"]
    resources = [module.sqs_validate_letter_template_files.sqs_queue_arn]
  }

  statement {
    sid    = "AllowKMS"
    effect = "Allow"
    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey"
    ]
    resources = [var.kms_key_arn]
  }
}
