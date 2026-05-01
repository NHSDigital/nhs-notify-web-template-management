resource "aws_cloudwatch_event_rule" "guardduty_quarantine_scan_failed_for_proof" {
  name        = "${local.csi}-quarantine-scan-failed-for-proof"
  description = "Matches quarantine 'GuardDuty Malware Protection Object Scan Result' events where the scan result is not NO_THREATS_FOUND"

  event_pattern = jsonencode({
    source      = ["aws.guardduty"]
    detail-type = ["GuardDuty Malware Protection Object Scan Result"]
    resources = [
      var.guardduty_protection_plan_quarantine_arn,
      #TODO: CCM-12777: delete
      aws_guardduty_malware_protection_plan.quarantine.arn
    ]
    detail = {
      s3ObjectDetails = {
        bucketName = [
          data.aws_s3_bucket.quarantine.id,
          # TODO: CCM-12777: delete
          module.s3bucket_quarantine.id
        ]
        objectKey = [
          { prefix = "${var.environment}/proofs/" },
          # TODO: CCM-12777: delete
          { prefix = "proofs/" }
        ]
      }
      scanResultDetails = {
        scanResultStatus = [{ anything-but = "NO_THREATS_FOUND" }]
      }
    }
  })
}

resource "aws_cloudwatch_event_target" "quarantine_scan_failed_process_proof" {
  rule = aws_cloudwatch_event_rule.guardduty_quarantine_scan_failed_for_proof.name
  arn  = module.lambda_process_proof.function_arn
}

resource "aws_cloudwatch_event_target" "quarantine_scan_failed_delete_object_for_proof" {
  rule = aws_cloudwatch_event_rule.guardduty_quarantine_scan_failed_for_proof.name
  arn  = module.lambda_delete_failed_scanned_object.function_arn
}
