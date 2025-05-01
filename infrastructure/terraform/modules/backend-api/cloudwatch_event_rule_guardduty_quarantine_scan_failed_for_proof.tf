resource "aws_cloudwatch_event_rule" "guardduty_quarantine_scan_failed_for_proof" {
  name        = "${local.csi}-quarantine-scan-failed"
  description = "Matches quarantine 'GuardDuty Malware Protection Object Scan Result' events where the scan result is not NO_THREATS_FOUND"

  event_pattern = jsonencode({
    source      = ["aws.guardduty"]
    detail-type = ["GuardDuty Malware Protection Object Scan Result"]
    resources   = [aws_guardduty_malware_protection_plan.quarantine.arn]
    detail = {
      s3ObjectDetails = {
        bucketName = [module.s3bucket_quarantine.id]
        objectKey  = [{ prefix = "proofs/" }]
      }
      scanResultDetails = {
        scanResultStatus = [{ anything-but = "NO_THREATS_FOUND" }]
      }
    }
  })
}

resource "aws_cloudwatch_event_target" "quarantine_scan_failed_process_proof" {
  rule     = aws_cloudwatch_event_rule.guardduty_quarantine_scan_failed_for_proof.name
  arn      = module.lambda_process_proof.function_arn
  role_arn = aws_iam_role.quarantine_scan_failed_for_proof.arn
}

resource "aws_cloudwatch_event_target" "quarantine_scan_failed_delete_object_for_proof" {
  rule     = aws_cloudwatch_event_rule.guardduty_quarantine_scan_failed_for_proof.name
  arn      = module.lambda_delete_failed_scanned_object.function_arn
  role_arn = aws_iam_role.quarantine_scan_failed_for_proof.arn
}
