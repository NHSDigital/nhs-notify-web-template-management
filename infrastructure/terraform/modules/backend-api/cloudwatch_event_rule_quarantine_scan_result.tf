resource "aws_cloudwatch_event_rule" "quarantine_guardduty_scan_result" {
  name        = "${local.csi}-quarantine-scan"
  description = "Matches quarantine 'GuardDuty Malware Protection Object Scan Result' events"

  event_pattern = jsonencode({
    source      = ["aws.guardduty"]
    detail-type = ["GuardDuty Malware Protection Object Scan Result"]
    resources   = [aws_guardduty_malware_protection_plan.quarantine.arn]
    detail = {
      s3ObjectDetails = {
        bucketName = [module.s3bucket_quarantine.id]
        objectKey  = [{ prefix = "pdf-template/" }, { prefix = "test-data/" }]
      }
    }
  })
}

resource "aws_cloudwatch_event_target" "quarantine_scan_to_update_status" {
  rule     = aws_cloudwatch_event_rule.quarantine_guardduty_scan_result.name
  arn      = module.lambda_set_file_virus_scan_status.function_arn
  role_arn = aws_iam_role.quarantine_scan_to_update_status.arn
}

resource "aws_iam_role" "quarantine_scan_to_update_status" {
  name               = "${local.csi}-quarantine-scan-to-enrichment"
  assume_role_policy = data.aws_iam_policy_document.events_assume_role.json
}

resource "aws_iam_role_policy" "quarantine_scan_to_update_status" {
  name   = "${local.csi}-quarantine-scan-to-enrichment"
  role   = aws_iam_role.quarantine_scan_to_update_status.id
  policy = data.aws_iam_policy_document.quarantine_scan_to_update_status.json
}

data "aws_iam_policy_document" "quarantine_scan_to_update_status" {
  version = "2012-10-17"

  statement {
    sid       = "AllowLambdaInvoke"
    effect    = "Allow"
    actions   = ["lambda:InvokeFunction"]
    resources = [module.lambda_set_file_virus_scan_status.function_arn]
  }
}
