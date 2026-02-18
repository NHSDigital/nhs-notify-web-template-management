resource "aws_cloudwatch_event_rule" "guardduty_quarantine_scan_passed_for_upload" {
  name        = "${local.csi}-quarantine-scan-passed-for-upload"
  description = "Matches quarantine 'GuardDuty Malware Protection Object Scan Result' events for pdf templates / csv test data where the scan result is NO_THREATS_FOUND"

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

resource "aws_cloudwatch_event_target" "quarantine_scan_passed_set_file_status_for_upload" {
  rule = aws_cloudwatch_event_rule.guardduty_quarantine_scan_passed_for_upload.name
  arn  = module.lambda_set_file_virus_scan_status_for_upload.function_arn
}

resource "aws_cloudwatch_event_target" "quarantine_scan_passed_copy_object_for_upload" {
  rule = aws_cloudwatch_event_rule.guardduty_quarantine_scan_passed_for_upload.name
  arn  = module.lambda_copy_scanned_object_to_internal.function_arn
}

resource "aws_cloudwatch_event_target" "quarantine_scan_passed_validate_files" {
  rule = aws_cloudwatch_event_rule.guardduty_quarantine_scan_passed_for_upload.name
  arn  = module.sqs_validate_letter_template_files.sqs_queue_arn
}
