module "lambda_validate_letter_template_files" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda?ref=v2.0.4"

  project        = var.project
  environment    = var.environment
  component      = var.component
  aws_account_id = var.aws_account_id
  region         = var.region

  kms_key_arn = var.kms_key_arn

  function_name = "validate-letter-template-files"

  function_module_name  = "validate-letter-template-files"
  handler_function_name = "handler"
  description           = "Validates content of letter template files"

  memory  = 512
  timeout = 10
  runtime = "nodejs20.x"
  layers  = [aws_lambda_layer_version.lambda_layer_pdfjs.arn]

  log_retention_in_days = var.log_retention_in_days
  iam_policy_document = {
    body = data.aws_iam_policy_document.validate_letter_template_files.json
  }

  lambda_env_vars         = local.backend_lambda_environment_variables
  function_s3_bucket      = var.function_s3_bucket
  function_code_base_path = local.lambdas_dir
  function_code_dir       = "backend-api/dist"

  send_to_firehose          = var.send_to_firehose
  log_destination_arn       = var.log_destination_arn
  log_subscription_role_arn = var.log_subscription_role_arn
}

resource "aws_lambda_event_source_mapping" "validate_letter_template_files" {
  event_source_arn                   = module.sqs_validate_letter_template_files.sqs_queue_arn
  function_name                      = module.lambda_validate_letter_template_files.function_name
  batch_size                         = 1
  maximum_batching_window_in_seconds = 0
  function_response_types = [
    "ReportBatchItemFailures"
  ]

  scaling_config {
    maximum_concurrency = 5
  }
}

data "aws_iam_policy_document" "validate_letter_template_files" {
  statement {
    sid    = "AllowDynamoAccess"
    effect = "Allow"

    actions = [
      "dynamodb:GetItem",
      "dynamodb:UpdateItem",
    ]

    resources = [
      aws_dynamodb_table.templates.arn,
    ]
  }

  statement {
    sid    = "AllowS3InternalGetObject"
    effect = "Allow"

    actions = [
      "s3:GetObject"
    ]

    resources = ["${module.s3bucket_internal.arn}/*"]
  }

  statement {
    sid    = "AllowS3InternalList"
    effect = "Allow"

    actions = [
      "s3:ListBucket",
      "s3:ListBucketVersions",
    ]

    resources = [module.s3bucket_internal.arn]
  }

  statement {
    sid    = "AllowSQSEventSource"
    effect = "Allow"

    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
    ]

    resources = [
      module.sqs_validate_letter_template_files.sqs_queue_arn
    ]
  }

  statement {
    sid    = "AllowKMSAccess"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:DescribeKey",
      "kms:Encrypt",
      "kms:GenerateDataKey",
      "kms:ReEncrypt*",
    ]

    resources = [
      var.kms_key_arn
    ]
  }

  statement {
    sid    = "AllowSSMParameterRead"
    effect = "Allow"

    actions = [
      "ssm:GetParameter",
    ]

    resources = [
      "arn:aws:ssm:${var.region}:${var.aws_account_id}:parameter${local.client_ssm_path_prefix}/*",
    ]
  }
}
