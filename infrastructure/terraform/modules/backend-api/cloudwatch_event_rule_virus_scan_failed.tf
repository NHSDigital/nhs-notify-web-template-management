resource "aws_cloudwatch_event_rule" "virus_scan_failed" {
  name        = "${local.csi}-virus-scan-failed"
  description = "Forwards enriched events from quarantine bucket where GuardDuty virus scan has failed"

  event_pattern = jsonencode({
    source      = ["templates.${var.environment}.${var.project}"]
    detail-type = ["object-tags-enriched"]
    detail = {
      bucket = {
        name = [module.s3bucket_quarantine.id]
      }
      object = {
        tags = {
          GuardDutyMalwareScanStatus = [{ anything-but = "NO_THREATS_FOUND" }]
        }
      }
    }
  })
}

resource "aws_cloudwatch_event_target" "scan_failed_delete_object" {
  rule     = aws_cloudwatch_event_rule.virus_scan_failed.name
  arn      = module.lambda_delete_failed_scanned_object.function_arn
  role_arn = aws_iam_role.handle_scan_failed.arn
}

resource "aws_cloudwatch_event_target" "scan_failed_set_file_status" {
  rule     = aws_cloudwatch_event_rule.virus_scan_failed.name
  arn      = module.lambda_set_file_virus_scan_status.function_arn
  role_arn = aws_iam_role.handle_scan_failed.arn
}

resource "aws_iam_role" "handle_scan_failed" {
  name               = "${local.csi}-virus-scan-failed"
  assume_role_policy = data.aws_iam_policy_document.events_assume_role.json
}

resource "aws_iam_role_policy" "handle_scan_failed" {
  name   = "${local.csi}-virus-scan-failed"
  role   = aws_iam_role.handle_scan_failed.id
  policy = data.aws_iam_policy_document.handle_scan_failed.json
}

data "aws_iam_policy_document" "handle_scan_failed" {
  version = "2012-10-17"

  statement {
    sid     = "AllowLambdaInvoke"
    effect  = "Allow"
    actions = ["lambda:InvokeFunction"]
    resources = [
      module.lambda_delete_failed_scanned_object.function_arn,
      module.lambda_set_file_virus_scan_status.function_arn,
    ]
  }
}
