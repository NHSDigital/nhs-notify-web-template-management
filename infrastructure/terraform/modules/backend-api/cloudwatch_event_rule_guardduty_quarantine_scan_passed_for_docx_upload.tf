resource "aws_cloudwatch_event_rule" "guardduty_quarantine_scan_passed_for_docx_upload" {
  name        = "${local.csi}-quarantine-scan-passed-for-docx-upload"
  description = "Matches quarantine 'GuardDuty Malware Protection Object Scan Result' events for docx templates where the scan result is NO_THREATS_FOUND"

  event_pattern = jsonencode({
    source      = ["aws.guardduty"]
    detail-type = ["GuardDuty Malware Protection Object Scan Result"]
    resources   = [aws_guardduty_malware_protection_plan.quarantine.arn]
    detail = {
      s3ObjectDetails = {
        bucketName = [module.s3bucket_quarantine.id]
        objectKey  = [{ prefix = "docx-template/" }]
      }
      scanResultDetails = {
        scanResultStatus = ["NO_THREATS_FOUND"]
      }
    }
  })
}

resource "aws_cloudwatch_event_target" "quarantine_scan_passed_set_file_status_for_docx_upload" {
  rule = aws_cloudwatch_event_rule.guardduty_quarantine_scan_passed_for_docx_upload.name
  arn  = module.lambda_set_file_virus_scan_status_for_upload.function_arn
}

resource "aws_cloudwatch_event_target" "quarantine_scan_passed_copy_object_for_docx_upload" {
  rule = aws_cloudwatch_event_rule.guardduty_quarantine_scan_passed_for_docx_upload.name
  arn  = module.lambda_copy_scanned_object_to_internal.function_arn
}
