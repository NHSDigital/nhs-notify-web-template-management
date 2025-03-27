resource "aws_pipes_pipe" "quarantine_scan_enrichment" {
  name = "${local.csi}-quarantine-scan-enrichment"

  role_arn = aws_iam_role.quarantine_scan_enrichment_pipe.arn

  source     = module.sqs_quarantine_scan_enrichment.sqs_queue_arn
  enrichment = module.lambda_enrich_guardduty_scan_result.function_arn
  target     = data.aws_cloudwatch_event_bus.default.arn

  target_parameters {
    eventbridge_event_bus_parameters {
      detail_type = "quarantine-scan-result-enriched"
      source      = "templates.${var.environment}.${var.project}"
      resources   = [module.s3bucket_quarantine.arn]
    }
  }

  log_configuration {
    cloudwatch_logs_log_destination {
      log_group_arn = aws_cloudwatch_log_group.quarantine_scan_enrichment_pipe.arn
    }
    level                  = "ERROR"
    include_execution_data = ["ALL"]
  }
}

resource "aws_iam_role" "quarantine_scan_enrichment_pipe" {
  name               = "${local.csi}-quarantine_scan_enrichment-pipe"
  description        = "Role used by Pipes enrich quarantine bucket scan complete events"
  assume_role_policy = data.aws_iam_policy_document.pipe_trust_policy.json
}

resource "aws_iam_role_policy" "quarantine_scan_enrichment_pipe" {
  role   = aws_iam_role.quarantine_scan_enrichment_pipe.id
  policy = data.aws_iam_policy_document.quarantine_scan_enrichment_pipe.json
}

data "aws_iam_policy_document" "pipe_trust_policy" {
  version = "2012-10-17"

  statement {
    sid     = "PipesAssumeRole"
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type = "Service"

      identifiers = ["pipes.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "quarantine_scan_enrichment_pipe" {
  version = "2012-10-17"

  statement {
    sid    = "AllowSqsSource"
    effect = "Allow"
    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
    ]
    resources = [module.sqs_quarantine_scan_enrichment.sqs_queue_arn]
  }

  statement {
    sid    = "AllowKMSDecrypt"
    effect = "Allow"
    actions = [
      "kms:Decrypt"
    ]
    resources = [var.kms_key_arn]
  }

  statement {
    sid       = "AllowLambdaEnrich"
    effect    = "Allow"
    actions   = ["lambda:InvokeFunction"]
    resources = [module.lambda_enrich_guardduty_scan_result.function_arn]
  }

  statement {
    sid     = "AllowEventBusTarget"
    effect  = "Allow"
    actions = ["events:PutEvents"]
    resources = [
      data.aws_cloudwatch_event_bus.default.arn
    ]
  }
}

resource "aws_cloudwatch_log_group" "quarantine_scan_enrichment_pipe" {
  name              = "/aws/vendedlogs/pipes/${local.csi}-quarantine-scan-enrichment"
  retention_in_days = var.log_retention_in_days
}
