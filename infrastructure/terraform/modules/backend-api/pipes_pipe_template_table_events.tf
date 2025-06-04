resource "aws_pipes_pipe" "template_table_events" {
  name               = "${local.csi}-template-table-events"
  role_arn           = aws_iam_role.pipe_template_table_events.arn
  source             = aws_dynamodb_table.templates.stream_arn
  target             = module.sqs_template_table_events.sqs_queue_arn
  desired_state      = var.enable_event_stream ? "RUNNING" : "STOPPED"
  kms_key_identifier = var.kms_key_arn

  source_parameters {
    dynamodb_stream_parameters {
      starting_position = "TRIM_HORIZON"
    }
  }

  target_parameters {
    sqs_queue_parameters {
      message_group_id = "$.dynamodb.Keys.id.S"
    }
  }

  log_configuration {
    level = "ERROR"
    cloudwatch_logs_log_destination {
      log_group_arn = aws_cloudwatch_log_group.pipe_template_table_events.arn
    }
  }
}

resource "aws_cloudwatch_log_group" "pipe_template_table_events" {
  name              = "/aws/vendedlogs/pipes/${local.csi}-template-table-events"
  kms_key_id        = var.kms_key_arn
  retention_in_days = var.log_retention_in_days
}

resource "aws_iam_role" "pipe_template_table_events" {
  name               = "${local.csi}-pipe-template-table-events"
  description        = "IAM Role for Pipe forward template table stream events to SQS"
  assume_role_policy = data.aws_iam_policy_document.pipes_trust_policy.json
}

data "aws_iam_policy_document" "pipes_trust_policy" {
  statement {
    sid     = "PipesAssumeRole"
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["pipes.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy" "pipe_template_table_events" {
  name   = "${local.csi}-pipe-template-table-events"
  role   = aws_iam_role.pipe_template_table_events.id
  policy = data.aws_iam_policy_document.pipe_template_table_events.json
}

data "aws_iam_policy_document" "pipe_template_table_events" {
  version = "2012-10-17"

  statement {
    sid    = "AllowDDBStreamRead"
    effect = "Allow"
    actions = [
      "dynamodb:DescribeStream",
      "dynamodb:GetRecords",
      "dynamodb:GetShardIterator",
      "dynamodb:ListStreams",
    ]
    resources = [aws_dynamodb_table.templates.stream_arn]
  }

  statement {
    sid       = "AllowSQSSendMessage"
    effect    = "Allow"
    actions   = ["sqs:SendMessage"]
    resources = [module.sqs_template_table_events.sqs_queue_arn]
  }

  statement {
    sid    = "AllowSqsKMS"
    effect = "Allow"
    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey"
    ]
    resources = [var.kms_key_arn]
  }

  statement {
    sid       = "AllowDynamoKMS"
    effect    = "Allow"
    actions   = ["kms:Decrypt"]
    resources = [local.dynamodb_kms_key_arn]
  }
}
