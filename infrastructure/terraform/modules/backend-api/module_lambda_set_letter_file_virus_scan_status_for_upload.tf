module "lambda_set_file_virus_scan_status_for_upload" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.28/terraform-lambda.zip"

  project        = var.project
  environment    = var.environment
  component      = var.component
  aws_account_id = var.aws_account_id
  region         = var.region

  kms_key_arn = var.kms_key_arn

  function_name = "set-upload-virus-scan-status"

  function_module_name  = "set-letter-upload-virus-scan-status"
  handler_function_name = "handler"
  description           = "Sets virus scan status on uploaded letter files"

  memory  = 512
  timeout = 20
  runtime = "nodejs20.x"

  log_retention_in_days = var.log_retention_in_days
  iam_policy_document = {
    body = data.aws_iam_policy_document.set_file_virus_scan_status_for_upload.json
  }

  lambda_env_vars         = local.backend_lambda_environment_variables
  function_s3_bucket      = var.function_s3_bucket
  function_code_base_path = local.lambdas_dir
  function_code_dir       = "backend-api/dist/set-letter-upload-virus-scan-status"

  send_to_firehose             = var.send_to_firehose
  log_destination_arn          = var.log_destination_arn
  log_subscription_role_arn    = var.log_subscription_role_arn
  enable_dlq_and_notifications = true
  sns_destination              = aws_sns_topic.main.arn
  sns_destination_kms_key      = var.kms_key_arn
}

data "aws_iam_policy_document" "set_file_virus_scan_status_for_upload" {
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
    sid    = "AllowKMSAccessDynamoDB"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:DescribeKey",
      "kms:Encrypt",
      "kms:GenerateDataKey*",
      "kms:ReEncrypt*",
    ]

    resources = [
      var.kms_key_arn
    ]
  }
}

resource "aws_lambda_permission" "allow_eventbridge_update_status_passed_upload" {
  statement_id  = "AllowFromEventBridgeUpdatePassed"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda_set_file_virus_scan_status_for_upload.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.guardduty_quarantine_scan_passed_for_upload.arn
}

resource "aws_lambda_permission" "allow_eventbridge_update_status_failed_upload" {
  statement_id  = "AllowFromEventBridgeUpdateFailed"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda_set_file_virus_scan_status_for_upload.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.guardduty_quarantine_scan_failed_for_upload.arn
}
