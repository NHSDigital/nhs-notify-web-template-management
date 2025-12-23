module "lambda_delete_failed_scanned_object" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.28/terraform-lambda.zip"

  project        = var.project
  environment    = var.environment
  component      = var.component
  aws_account_id = var.aws_account_id
  region         = var.region

  kms_key_arn = var.kms_key_arn

  function_name = "delete-failed-scanned-object"

  function_module_name  = "delete-failed-scanned-object"
  handler_function_name = "handler"
  description           = "Deletes quarantine files that have failed virus scan check"

  memory  = 512
  timeout = 20
  runtime = "nodejs20.x"

  log_retention_in_days = var.log_retention_in_days
  iam_policy_document = {
    body = data.aws_iam_policy_document.delete_failed_scanned_object.json
  }

  lambda_env_vars         = local.backend_lambda_environment_variables
  function_s3_bucket      = var.function_s3_bucket
  function_code_base_path = local.lambdas_dir
  function_code_dir       = "backend-api/dist/delete-failed-scanned-object"

  send_to_firehose             = var.send_to_firehose
  log_destination_arn          = var.log_destination_arn
  log_subscription_role_arn    = var.log_subscription_role_arn
  enable_dlq_and_notifications = true
  sns_destination              = aws_sns_topic.main.arn
  sns_destination_kms_key      = var.kms_key_arn
}

data "aws_iam_policy_document" "delete_failed_scanned_object" {
  statement {
    sid    = "AllowS3QuarantineDelete"
    effect = "Allow"

    actions = [
      "s3:DeleteObject",
      "s3:DeleteObjectVersion",
    ]

    resources = ["${module.s3bucket_quarantine.arn}/*"]
  }

  statement {
    sid    = "AllowKMSAccessSQSDLQ"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey",
    ]

    resources = [
      var.kms_key_arn,
    ]
  }
}

resource "aws_lambda_permission" "allow_eventbridge_delete_upload" {
  statement_id  = "AllowFromEventBridgeDeleteUpload"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda_delete_failed_scanned_object.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.guardduty_quarantine_scan_failed_for_upload.arn
}

resource "aws_lambda_permission" "allow_eventbridge_delete_proof" {
  statement_id  = "AllowFromEventBridgeDeleteProof"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda_delete_failed_scanned_object.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.guardduty_quarantine_scan_failed_for_proof.arn
}
