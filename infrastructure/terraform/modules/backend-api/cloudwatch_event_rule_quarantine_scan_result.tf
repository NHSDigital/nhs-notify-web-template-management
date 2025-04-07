resource "aws_cloudwatch_event_rule" "quarantine_scan_result" {
  name        = "${local.csi}-quarantine-tags-added"
  description = "Forwards quarantine 'GuardDuty Malware Protection Object Scan Result' events for enrichment"

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

resource "aws_cloudwatch_event_target" "quarantine_scan_to_enrichment" {
  rule     = aws_cloudwatch_event_rule.quarantine_scan_result.name
  arn      = module.sqs_quarantine_scan_enrichment.sqs_queue_arn
  role_arn = aws_iam_role.quarantine_scan_to_enrichment.arn
}

resource "aws_iam_role" "quarantine_scan_to_enrichment" {
  name               = "${local.csi}-quarantine-scan-to-enrichment"
  assume_role_policy = data.aws_iam_policy_document.events_assume_role.json
}

resource "aws_iam_role_policy" "quarantine_scan_to_enrichment" {
  name   = "${local.csi}-quarantine-scan-to-enrichment"
  role   = aws_iam_role.quarantine_scan_to_enrichment.id
  policy = data.aws_iam_policy_document.quarantine_scan_to_enrichment.json
}

data "aws_iam_policy_document" "quarantine_scan_to_enrichment" {
  version = "2012-10-17"

  statement {
    sid       = "AllowSQSSendMessage"
    effect    = "Allow"
    actions   = ["sqs:SendMessage"]
    resources = [module.sqs_quarantine_scan_enrichment.sqs_queue_arn]
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
