module "lambda_process_proof" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.29/terraform-lambda.zip"

  project        = var.project
  environment    = var.environment
  component      = var.component
  aws_account_id = var.aws_account_id
  region         = var.region

  kms_key_arn = var.kms_key_arn

  function_name = "process-proof"

  function_module_name  = "process-proof"
  handler_function_name = "handler"
  description           = "Processes letter proofs"

  memory  = 512
  timeout = 20
  runtime = "nodejs20.x"

  log_retention_in_days = var.log_retention_in_days
  iam_policy_document = {
    body = data.aws_iam_policy_document.process_proof.json
  }

  lambda_env_vars         = local.backend_lambda_environment_variables
  function_s3_bucket      = var.function_s3_bucket
  function_code_base_path = local.lambdas_dir
  function_code_dir       = "backend-api/dist/process-proof"

  send_to_firehose             = var.send_to_firehose
  log_destination_arn          = var.log_destination_arn
  log_subscription_role_arn    = var.log_subscription_role_arn
  enable_dlq_and_notifications = true
  sns_destination              = aws_sns_topic.main.arn
  sns_destination_kms_key      = var.kms_key_arn
}

data "aws_iam_policy_document" "process_proof" {
  statement {
    sid    = "AllowDynamoAccess"
    effect = "Allow"

    actions = [
      "dynamodb:UpdateItem",
    ]

    resources = [
      aws_dynamodb_table.templates.arn,
    ]
  }

  statement {
    sid    = "AllowDynamoGSIAccess"
    effect = "Allow"

    actions = [
      "dynamodb:Query",
    ]

    resources = [
      "${aws_dynamodb_table.templates.arn}/index/QueryById",
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
      var.kms_key_arn,
    ]
  }

  statement {
    sid    = "AllowS3QuarantineGetObject"
    effect = "Allow"

    actions = [
      "s3:ListBucket",
      "s3:GetObject",
      "s3:GetObjectVersion",
      "s3:GetObjectTagging",
      "s3:GetObjectVersionTagging",
    ]

    resources = ["${module.s3bucket_quarantine.arn}/*"]
  }

  statement {
    sid    = "AllowS3InternalWrite"
    effect = "Allow"

    actions = [
      "s3:PutObject",
      "s3:PutObjectVersion",
      "s3:PutObjectTagging",
      "s3:PutObjectVersionTagging",
    ]

    resources = ["${module.s3bucket_internal.arn}/*"]
  }

  statement {
    sid    = "AllowS3DownloadWrite"
    effect = "Allow"

    actions = [
      "s3:PutObject",
      "s3:PutObjectVersion",
      "s3:PutObjectTagging",
      "s3:PutObjectVersionTagging",
    ]

    resources = ["${module.s3bucket_download.arn}/*"]
  }
}

resource "aws_lambda_permission" "allow_eventbridge_process_passed_proof" {
  statement_id  = "AllowFromEventBridgeProcessPassedProof"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda_process_proof.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.guardduty_quarantine_scan_passed_for_proof.arn
}

resource "aws_lambda_permission" "allow_eventbridge_process_failed_proof" {
  statement_id  = "AllowFromEventBridgeProcessFailedProof"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda_process_proof.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.guardduty_quarantine_scan_failed_for_proof.arn
}
