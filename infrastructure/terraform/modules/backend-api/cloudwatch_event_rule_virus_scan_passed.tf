resource "aws_cloudwatch_event_rule" "virus_scan_passed" {
  name        = "${local.csi}-virus-scan-passed"
  description = "Forwards enriched events to SQS from quarantine bucket where GuardDuty virus scan has passed with no threats"

  event_pattern = jsonencode({
    source      = ["templates.${var.environment}.${var.project}"]
    detail-type = ["object-tags-enriched"]
    detail = {
      bucket = {
        name = [module.s3bucket_quarantine.id]
      }
      object = {
        tags = {
          GuardDutyMalwareScanStatus = ["NO_THREATS_FOUND"]
        }
      }
    }
  })
}

resource "aws_cloudwatch_event_target" "scan_passed_copy_object" {
  rule     = aws_cloudwatch_event_rule.virus_scan_passed.name
  arn      = module.lambda_copy_scanned_object_to_internal.function_arn
  role_arn = aws_iam_role.handle_scan_passed.arn
}

resource "aws_cloudwatch_event_target" "scan_passed_set_file_status" {
  rule     = aws_cloudwatch_event_rule.virus_scan_passed.name
  arn      = module.lambda_set_file_virus_scan_status.function_arn
  role_arn = aws_iam_role.handle_scan_passed.arn
}

resource "aws_iam_role" "handle_scan_passed" {
  name               = "${local.csi}-virus-scan-passed"
  assume_role_policy = data.aws_iam_policy_document.events_assume_role.json
}

resource "aws_iam_role_policy" "handle_scan_passed" {
  name   = "${local.csi}-virus-scan-passed"
  role   = aws_iam_role.handle_scan_passed.id
  policy = data.aws_iam_policy_document.handle_scan_passed.json
}

data "aws_iam_policy_document" "handle_scan_passed" {
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
}
