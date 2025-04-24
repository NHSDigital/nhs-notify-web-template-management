resource "aws_iam_role" "quarantine_scan_failed" {
  name               = "${local.csi}-quarantine-scan-failed"
  description        = "IAM Role for GuardDuty failure CloudWatch events to trigger follow up actions"
  assume_role_policy = data.aws_iam_policy_document.events_assume_role.json
}

resource "aws_iam_role_policy" "quarantine_scan_failed" {
  name   = "${local.csi}-quarantine-scan-failed"
  role   = aws_iam_role.quarantine_scan_failed.id
  policy = data.aws_iam_policy_document.quarantine_scan_failed.json
}

data "aws_iam_policy_document" "quarantine_scan_failed" {
  version = "2012-10-17"

  statement {
    sid     = "AllowLambdaInvoke"
    effect  = "Allow"
    actions = ["lambda:InvokeFunction"]
    resources = [
      module.lambda_set_file_virus_scan_status.function_arn,
      module.lambda_delete_failed_scanned_object.function_arn
    ]
  }
}
