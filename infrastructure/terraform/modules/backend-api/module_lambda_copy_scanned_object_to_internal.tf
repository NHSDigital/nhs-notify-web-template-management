module "lambda_copy_scanned_object_to_internal" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.28/terraform-lambda.zip"

  project        = var.project
  environment    = var.environment
  component      = var.component
  aws_account_id = var.aws_account_id
  region         = var.region

  kms_key_arn = var.kms_key_arn

  function_name = "copy-scanned-file"

  function_module_name  = "copy-scanned-object-to-internal"
  handler_function_name = "handler"
  description           = "Copies quarantine files that have passed virus scan check to internal bucket"

  memory  = 512
  timeout = 20
  runtime = "nodejs20.x"

  log_retention_in_days = var.log_retention_in_days
  iam_policy_document = {
    body = data.aws_iam_policy_document.copy_scanned_object_to_internal.json
  }

  lambda_env_vars         = local.backend_lambda_environment_variables
  function_s3_bucket      = var.function_s3_bucket
  function_code_base_path = local.lambdas_dir
  function_code_dir       = "backend-api/dist/copy-scanned-object-to-internal"

  send_to_firehose             = var.send_to_firehose
  log_destination_arn          = var.log_destination_arn
  log_subscription_role_arn    = var.log_subscription_role_arn
  enable_dlq_and_notifications = true
  sns_destination              = aws_sns_topic.main.arn
  sns_destination_kms_key      = var.kms_key_arn
}

data "aws_iam_policy_document" "copy_scanned_object_to_internal" {
  statement {
    sid    = "AllowS3QuarantineList"
    effect = "Allow"

    actions = [
      "s3:ListBucket",
      "s3:ListBucketVersions",
    ]

    resources = [module.s3bucket_quarantine.arn]
  }

  statement {
    sid    = "AllowS3QuarantineGetObject"
    effect = "Allow"

    actions = [
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
    sid    = "AllowKMSAccess"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey",
    ]

    resources = [
      var.kms_key_arn
    ]
  }
}

resource "aws_lambda_permission" "allow_eventbridge_copy_upload" {
  statement_id  = "AllowFromEventBridgeCopyUpload"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda_copy_scanned_object_to_internal.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.guardduty_quarantine_scan_passed_for_upload.arn
}
