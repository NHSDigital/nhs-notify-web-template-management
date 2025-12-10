resource "aws_pipes_pipe" "routing_config_table_events" {
  depends_on = [module.sqs_routing_config_table_events_pipe_dlq]

  name               = "${local.csi}-routing-config-table-events"
  role_arn           = aws_iam_role.pipe_routing_config_table_events.arn
  source             = aws_dynamodb_table.routing_configuration.stream_arn
  target             = module.sqs_template_mgmt_events.sqs_queue_arn
  desired_state      = "RUNNING"
  kms_key_identifier = var.kms_key_arn

  source_parameters {
    dynamodb_stream_parameters {
      starting_position                  = "TRIM_HORIZON"
      on_partial_batch_item_failure      = "AUTOMATIC_BISECT"
      batch_size                         = 10
      maximum_batching_window_in_seconds = 5
      maximum_retry_attempts             = 5
      maximum_record_age_in_seconds      = -1

      dead_letter_config {
        arn = module.sqs_routing_config_table_events_pipe_dlq.sqs_queue_arn
      }
    }
  }

  target_parameters {
    input_template = <<-EOF
      {
        "dynamodb": <$.dynamodb>,
        "eventID": <$.eventID>,
        "eventName": <$.eventName>,
        "eventSource": <$.eventSource>,
        "tableName": "${aws_dynamodb_table.routing_configuration.name}"
      }
    EOF

    sqs_queue_parameters {
      message_group_id         = "$.dynamodb.Keys.id.S"
      message_deduplication_id = "$.eventID"
    }
  }

  log_configuration {
    level                  = "ERROR"
    include_execution_data = ["ALL"]

    cloudwatch_logs_log_destination {
      log_group_arn = aws_cloudwatch_log_group.pipe_routing_config_table_events.arn
    }
  }
}

resource "aws_iam_role" "pipe_routing_config_table_events" {
  name               = "${local.csi}-pipe-routing-config-table-events"
  description        = "IAM Role for Pipe to forward routing config table stream events to SQS"
  assume_role_policy = data.aws_iam_policy_document.pipes_routing_config_trust_policy.json
}

data "aws_iam_policy_document" "pipes_routing_config_trust_policy" {
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

resource "aws_iam_role_policy" "pipe_routing_config_table_events" {
  name   = "${local.csi}-pipe-routing-config-table-events"
  role   = aws_iam_role.pipe_routing_config_table_events.id
  policy = data.aws_iam_policy_document.pipe_routing_config_table_events.json
}

data "aws_iam_policy_document" "pipe_routing_config_table_events" {
  version = "2012-10-17"

  statement {
    sid    = "AllowDynamoStreamRead"
    effect = "Allow"
    actions = [
      "dynamodb:DescribeStream",
      "dynamodb:GetRecords",
      "dynamodb:GetShardIterator",
      "dynamodb:ListStreams",
    ]
    resources = [aws_dynamodb_table.routing_configuration.stream_arn]
  }

  statement {
    sid     = "AllowSqsSendMessage"
    effect  = "Allow"
    actions = ["sqs:SendMessage"]
    resources = [
      module.sqs_template_mgmt_events.sqs_queue_arn,
      module.sqs_routing_config_table_events_pipe_dlq.sqs_queue_arn,
    ]
  }

  statement {
    sid    = "AllowKmsUsage"
    effect = "Allow"
    actions = [
      "kms:Decrypt",
      "kms:Encrypt",
      "kms:GenerateDataKey*"
    ]
    resources = [var.kms_key_arn]
  }
}
