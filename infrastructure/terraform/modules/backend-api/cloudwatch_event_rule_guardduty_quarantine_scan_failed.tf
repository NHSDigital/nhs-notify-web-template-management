resource "aws_cloudwatch_event_rule" "guardduty_quarantine_scan_failed" {
  name        = "${local.csi}-quarantine-scan-failed"
  description = "Matches quarantine 'GuardDuty Malware Protection Object Scan Result' events where the scan result is not NO_THREATS_FOUND"

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
        scanResultStatus = [{ anything-but = "NO_THREATS_FOUND" }]
      }
    }
  })
}

resource "aws_cloudwatch_event_target" "quarantine_scan_failed_set_file_status" {
  rule     = aws_cloudwatch_event_rule.guardduty_quarantine_scan_failed.name
  arn      = module.lambda_set_file_virus_scan_status.function_arn
  role_arn = aws_iam_role.quarantine_scan_failed.arn
}

resource "aws_cloudwatch_event_target" "quarantine_scan_failed_delete_object" {
  rule     = aws_cloudwatch_event_rule.guardduty_quarantine_scan_failed.name
  arn      = module.lambda_delete_failed_scanned_object.function_arn
  role_arn = aws_iam_role.quarantine_scan_failed.arn
}
