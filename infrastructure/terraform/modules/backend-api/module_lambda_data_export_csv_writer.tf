module "lambda_data_export_csv_writer" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.22/terraform-lambda.zip"

  project        = var.project
  environment    = var.environment
  component      = var.component
  aws_account_id = var.aws_account_id
  region         = var.region

  kms_key_arn = var.kms_key_arn

  function_name          = "data-export-csv-writer"
  function_module_name   = "data-export-csv-writer"
  handler_function_name  = "handler"
  description            = "Lambda that consumes SQS messages and writes the 'data' object to S3 as CSV"
  memory                 = 512
  timeout                = 30
  runtime                = "nodejs20.x"
  log_retention_in_days  = var.log_retention_in_days
  function_s3_bucket     = var.function_s3_bucket
  function_code_base_path = local.lambdas_dir
  function_code_dir       = "data-export-csv-writer/dist"

  lambda_env_vars = {
    BUCKET_NAME = module.s3bucket_data_export.id
    KEY_PREFIX  = "exports/"
    NODE_OPTIONS = "--enable-source-maps"
  }

  iam_policy_document = {
    body = data.aws_iam_policy_document.lambda_data_export_csv_writer.json
  }

  send_to_firehose          = var.send_to_firehose
  log_destination_arn       = var.log_destination_arn
  log_subscription_role_arn = var.log_subscription_role_arn
}

resource "aws_lambda_event_source_mapping" "lambda_data_export_csv_writer" {
  event_source_arn                   = module.sqs_data_export.sqs_queue_arn
  function_name                      = module.lambda_data_export_csv_writer.function_name
  batch_size                         = 10
  maximum_batching_window_in_seconds = 0
  function_response_types = [
    "ReportBatchItemFailures"
  ]

  scaling_config {
    maximum_concurrency = 5
  }
}

data "aws_iam_policy_document" "lambda_data_export_csv_writer" {
  statement {
    sid    = "AllowSQSDLQ"
    effect = "Allow"
    actions = [
      "sqs:SendMessage",
    ]
    resources = [
      module.sqs_data_export.sqs_dlq_arn,
    ]
  }

  statement {
    sid    = "AllowSQSConsume"
    effect = "Allow"
    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:ChangeMessageVisibility",
    ]
    resources = [
      module.sqs_data_export.sqs_queue_arn,
    ]
  }

  statement {
    sid    = "AllowS3Write"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:AbortMultipartUpload",
      "s3:ListMultipartUploadParts"
    ]
    resources = [
      "${module.s3bucket_data_export.arn}/*"
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
