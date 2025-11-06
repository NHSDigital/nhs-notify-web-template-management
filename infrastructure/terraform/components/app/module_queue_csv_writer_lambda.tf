module "queue_csv_writer_lambda" {
  source                    = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.22/terraform-lambda.zip"

  function_name             = "queue-csv-writer"
  description               = "Lambda that consumes SQS messages and writes data objects to CSV in S3"

  aws_account_id            = var.aws_account_id
  component                 = var.component
  environment               = var.environment
  project                   = var.project
  region                    = var.region
  group                     = var.group

  log_retention_in_days     = var.log_retention_in_days
  kms_key_arn               = module.kms.key_arn

  iam_policy_document = {
    body = data.aws_iam_policy_document.queue_csv_writer_lambda.json
  }

  function_s3_bucket        = local.acct.s3_buckets["artefacts"]["id"]
  function_code_base_path   = local.lambdas_source_code_dir
  function_code_dir         = "queue-csv-writer/dist"
  handler_function_name     = "handler"
  runtime                   = "nodejs20.x"
  memory                    = 512  # agent: rationale lightweight CSV transformation; no heavy parsing/compression
  timeout                   = 20

  lambda_env_vars = {
    EVENT_CSV_BUCKET_NAME   = module.s3bucket_event_csv.id
  }
}

resource "aws_lambda_event_source_mapping" "queue_csv_writer" {
  event_source_arn                   = module.sqs_event_csv.sqs_queue_arn
  function_name                      = module.queue_csv_writer_lambda.function_name
  batch_size                         = 10  # agent: rationale small batch keeps latency low and limits CSV size per object
  maximum_batching_window_in_seconds = 0
  function_response_types            = ["ReportBatchItemFailures"]
}

data "aws_iam_policy_document" "queue_csv_writer_lambda" {
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
      module.sqs_event_csv.sqs_queue_arn,
    ]
  }

  statement {
    sid    = "AllowSQSDLQ"
    effect = "Allow"

    actions = [
      "sqs:SendMessage",
    ]

    resources = [
      module.sqs_event_csv.sqs_dlq_arn,
    ]
  }

  statement {
    sid    = "AllowS3Write"
    effect = "Allow"

    actions = [
      "s3:PutObject",
    ]

    resources = [
      "${module.s3bucket_event_csv.arn}/*",
    ]
  }

  statement {
    sid    = "AllowKMSAccess"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:DescribeKey",
      "kms:Encrypt",
      "kms:GenerateDataKey*",
      "kms:ReEncrypt*",
    ]

    resources = [
      module.kms.key_arn,
    ]
  }
}
