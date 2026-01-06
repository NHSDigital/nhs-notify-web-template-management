module "lambda_event_publisher" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.29/terraform-lambda.zip"

  project        = var.project
  environment    = var.environment
  component      = var.component
  aws_account_id = var.aws_account_id
  region         = var.region

  kms_key_arn = var.kms_key_arn

  function_name = "event-publisher"

  function_module_name  = "event-publisher"
  handler_function_name = "handler"
  description           = "Lambda that accepts events from the dynamodb stream and publishes them to SNS"

  memory  = 512
  timeout = 20
  runtime = "nodejs20.x"

  log_retention_in_days = var.log_retention_in_days
  iam_policy_document = {
    body = data.aws_iam_policy_document.event_publisher.json
  }

  lambda_env_vars = {
    EVENT_SOURCE              = "//notify.nhs.uk/${var.component}/${var.group}/${var.environment}"
    ROUTING_CONFIG_TABLE_NAME = aws_dynamodb_table.routing_configuration.name
    SNS_TOPIC_ARN             = coalesce(var.sns_topic_arn, aws_sns_topic.main.arn)
    TEMPLATES_TABLE_NAME      = aws_dynamodb_table.templates.name
  }

  function_s3_bucket      = var.function_s3_bucket
  function_code_base_path = local.lambdas_dir
  function_code_dir       = "event-publisher/dist"

  send_to_firehose          = var.send_to_firehose
  log_destination_arn       = var.log_destination_arn
  log_subscription_role_arn = var.log_subscription_role_arn
}

resource "aws_lambda_event_source_mapping" "event_publisher" {
  event_source_arn                   = module.sqs_template_mgmt_events.sqs_queue_arn
  function_name                      = module.lambda_event_publisher.function_name
  batch_size                         = 5
  maximum_batching_window_in_seconds = 0
  function_response_types = [
    "ReportBatchItemFailures"
  ]

  scaling_config {
    maximum_concurrency = 5
  }
}

data "aws_iam_policy_document" "event_publisher" {
  statement {
    sid    = "AllowSNS"
    effect = "Allow"

    actions = [
      "sns:Publish",
    ]

    resources = [
      coalesce(var.sns_topic_arn, aws_sns_topic.main.arn)
    ]
  }

  statement {
    sid    = "AllowSQSDLQ"
    effect = "Allow"

    actions = [
      "sqs:SendMessage",
    ]

    resources = [
      module.sqs_template_mgmt_events.sqs_dlq_arn,
    ]
  }

  statement {
    sid    = "AllowSQS"
    effect = "Allow"

    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:ChangeMessageVisibility",
    ]

    resources = [
      module.sqs_template_mgmt_events.sqs_queue_arn,
    ]
  }

  statement {
    sid    = "AllowKMS"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:DescribeKey",
      "kms:Encrypt",
      "kms:GenerateDataKey*",
      "kms:ReEncrypt*",
    ]

    resources = [
      var.kms_key_arn,
    ]
  }
}
