resource "aws_iam_role" "quarantine_scan_passed_for_upload" {
  name               = "${local.csi}-quarantine-scan-passed-uploads"
  assume_role_policy = data.aws_iam_policy_document.events_assume_role.json
}

resource "aws_iam_role_policy" "quarantine_scan_passed_for_upload" {
  name   = "${local.csi}-quarantine-scan-passed-for-upload"
  role   = aws_iam_role.quarantine_scan_passed_for_upload.id
  policy = data.aws_iam_policy_document.quarantine_scan_passed_for_upload.json
}

data "aws_iam_policy_document" "quarantine_scan_passed_for_upload" {
  version = "2012-10-17"

  statement {
    sid     = "AllowLambdaInvoke"
    effect  = "Allow"
    actions = ["lambda:InvokeFunction"]
    resources = [
      module.lambda_copy_scanned_object_to_internal.function_arn,
      module.lambda_set_file_virus_scan_status_for_upload.function_arn,
    ]
  }

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
