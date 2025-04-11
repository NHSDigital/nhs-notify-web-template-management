resource "aws_cloudwatch_event_rule" "guardduty_quarantine_scan_passed" {
  name        = "${local.csi}-quarantine-scan-passed"
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

resource "aws_cloudwatch_event_target" "guardduty_quarantine_scan_passed_copy_object" {
  rule     = aws_cloudwatch_event_rule.guardduty_quarantine_scan_passed.name
  arn      = module.lambda_copy_scanned_object_to_internal.function_arn
  role_arn = aws_iam_role.guardduty_quarantine_scan_passed.arn
}

resource "aws_cloudwatch_event_target" "guardduty_quarantine_scan_passed_set_file_status" {
  rule     = aws_cloudwatch_event_rule.guardduty_quarantine_scan_passed.name
  arn      = module.lambda_set_file_virus_scan_status.function_arn
  role_arn = aws_iam_role.guardduty_quarantine_scan_passed.arn
}

resource "aws_cloudwatch_event_target" "guardduty_quarantine_scan_passed_validate_files" {
  rule     = aws_cloudwatch_event_rule.guardduty_quarantine_scan_passed.name
  arn      = module.sqs_validate_letter_template_files.sqs_queue_arn
  role_arn = aws_iam_role.guardduty_quarantine_scan_passed.arn
}

resource "aws_iam_role" "guardduty_quarantine_scan_passed" {
  name               = "${local.csi}-quarantine-scan-passed"
  assume_role_policy = data.aws_iam_policy_document.events_assume_role.json
}

resource "aws_iam_role_policy" "guardduty_quarantine_scan_passed" {
  name   = "${local.csi}-quarantine-scan-passed"
  role   = aws_iam_role.guardduty_quarantine_scan_passed.id
  policy = data.aws_iam_policy_document.guardduty_quarantine_scan_passed.json
}

data "aws_iam_policy_document" "guardduty_quarantine_scan_passed" {
  version = "2012-10-17"

  statement {
    sid     = "AllowLambdaInvoke"
    effect  = "Allow"
    actions = ["lambda:InvokeFunction"]
    resources = [
      module.lambda_copy_scanned_object_to_internal.function_arn,
      module.lambda_set_file_virus_scan_status.function_arn,
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
