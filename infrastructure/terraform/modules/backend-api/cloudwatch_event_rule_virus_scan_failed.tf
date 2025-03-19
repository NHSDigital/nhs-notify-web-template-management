resource "aws_cloudwatch_event_rule" "virus_scan_failed" {
  name        = "${local.csi}-virus-scan-failed"
  description = "Forwards enriched events to SQS from quarantine bucket where GuardDuty virus scan has failed"

  event_pattern = jsonencode({
    source      = ["templates.${var.environment}.${var.project}"]
    detail-type = ["object-tags-enriched"]
    detail = {
      bucket = {
        name = [module.s3bucket_quarantine.id]
      }
      object = {
        tags = {
          GuardDutyMalwareScanStatus = ["THREATS_FOUND", "UNSUPPORTED", "ACCESS_DENIED", "FAILED"]
        }
      }
    }
  })
}

resource "aws_cloudwatch_event_target" "virus_scan_failed" {
  rule     = aws_cloudwatch_event_rule.virus_scan_failed.name
  arn      = module.sqs_virus_scan_failed.sqs_queue_arn
  role_arn = aws_iam_role.virus_scan_failed_to_sqs.arn
}

resource "aws_iam_role" "virus_scan_failed_to_sqs" {
  name               = "${local.csi}-virus-scan-failed-to-sqs"
  assume_role_policy = data.aws_iam_policy_document.events_assume_role.json
}

resource "aws_iam_role_policy" "virus_scan_failed_to_sqs" {
  name   = "${local.csi}-virus-scan-failed-to-sqs"
  role   = aws_iam_role.virus_scan_failed_to_sqs.id
  policy = data.aws_iam_policy_document.virus_scan_failed_to_sqs.json
}

data "aws_iam_policy_document" "virus_scan_failed_to_sqs" {
  version = "2012-10-17"

  statement {
    sid       = "AllowSQSSendMessage"
    effect    = "Allow"
    actions   = ["sqs:SendMessage"]
    resources = [module.sqs_virus_scan_failed.sqs_queue_arn]
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
