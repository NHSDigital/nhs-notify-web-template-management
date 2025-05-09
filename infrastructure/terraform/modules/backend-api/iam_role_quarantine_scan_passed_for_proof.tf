resource "aws_iam_role" "quarantine_scan_passed_for_proof" {
  name               = "${local.csi}-quarantine-scan-passed-for-proof"
  assume_role_policy = data.aws_iam_policy_document.events_assume_role.json
}

resource "aws_iam_role_policy" "quarantine_scan_passed_for_proof" {
  name   = "${local.csi}-quarantine-scan-passed-for-proof"
  role   = aws_iam_role.quarantine_scan_passed_for_proof.id
  policy = data.aws_iam_policy_document.quarantine_scan_passed_for_proof.json
}

data "aws_iam_policy_document" "quarantine_scan_passed_for_proof" {
  version = "2012-10-17"

  statement {
    sid     = "AllowLambdaInvoke"
    effect  = "Allow"
    actions = ["lambda:InvokeFunction"]
    resources = [
      module.lambda_process_proof.function_arn,
    ]
  }
}
