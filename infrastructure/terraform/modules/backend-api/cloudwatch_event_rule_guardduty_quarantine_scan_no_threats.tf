resource "aws_cloudwatch_event_rule" "guardduty_quarantine_scan_no_threats" {
  name        = "${local.csi}-quarantine-scan-no_threats"
  description = "Matches quarantine 'GuardDuty Malware Protection Object Scan Result' events where the scan result is NO_THREATS_FOUND"

  event_pattern = jsonencode({
    source      = ["aws.guardduty"]
    detail-type = ["GuardDuty Malware Protection Object Scan Result"]
    resources   = [aws_guardduty_malware_protection_plan.quarantine.arn]
    detail = {
      s3ObjectDetails = {
        bucketName = [module.s3bucket_quarantine.id]
        objectKey  = [{ prefix = "pdf-template/" }, { prefix = "test-data/" }]
      }
      scanResultDetails = {
        scanResultStatus = ["NO_THREATS_FOUND"]
      }
    }
  })
}

resource "aws_cloudwatch_event_target" "guardduty_quarantine_scan_no_threats_copy_object" {
  rule     = aws_cloudwatch_event_rule.guardduty_quarantine_scan_no_threats.name
  arn      = module.lambda_copy_scanned_object_to_internal.function_arn
  role_arn = aws_iam_role.guardduty_quarantine_scan_no_threats.arn
}

resource "aws_iam_role" "guardduty_quarantine_scan_no_threats" {
  name               = "${local.csi}-quarantine-scan-no-threats"
  assume_role_policy = data.aws_iam_policy_document.events_assume_role.json
}

resource "aws_iam_role_policy" "guardduty_quarantine_scan_no_threats" {
  name   = "${local.csi}-quarantine-scan-no-threats"
  role   = aws_iam_role.guardduty_quarantine_scan_no_threats.id
  policy = data.aws_iam_policy_document.guardduty_quarantine_scan_no_threats.json
}

data "aws_iam_policy_document" "guardduty_quarantine_scan_no_threats" {
  version = "2012-10-17"

  statement {
    sid       = "AllowLambdaInvoke"
    effect    = "Allow"
    actions   = ["lambda:InvokeFunction"]
    resources = [module.lambda_copy_scanned_object_to_internal.function_arn]
  }
}
