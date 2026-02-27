module "lambda_forward_initial_render_request" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.29/terraform-lambda.zip"

  project        = var.project
  environment    = var.environment
  component      = var.component
  aws_account_id = var.aws_account_id
  region         = var.region

  kms_key_arn = var.kms_key_arn

  function_name = "forward-initial-render-request"

  function_module_name  = "forward-initial-render-request"
  handler_function_name = "handler"
  description           = "Parses s3 events for successfully scanned docx template uploads and sends to renderer queue"

  memory  = 512
  timeout = 20
  runtime = "nodejs22.x"

  log_retention_in_days = var.log_retention_in_days
  iam_policy_document = {
    body = data.aws_iam_policy_document.forward_initial_render_request.json
  }

  lambda_env_vars         = local.backend_lambda_environment_variables
  function_s3_bucket      = var.function_s3_bucket
  function_code_base_path = local.lambdas_dir
  function_code_dir       = "backend-api/dist/forward-initial-render-request"

  send_to_firehose             = var.send_to_firehose
  log_destination_arn          = var.log_destination_arn
  log_subscription_role_arn    = var.log_subscription_role_arn
  enable_dlq_and_notifications = true
  sns_destination              = aws_sns_topic.main.arn
  sns_destination_kms_key      = var.kms_key_arn
}

data "aws_iam_policy_document" "forward_initial_render_request" {
  statement {
    sid    = "AllowRenderSQS"
    effect = "Allow"

    actions = [
      "sqs:SendMessage",
    ]

    resources = [
      module.sqs_letter_render.sqs_queue_arn,
    ]
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

resource "aws_lambda_permission" "allow_eventbridge_foward_initial_render" {
  statement_id  = "AllowFromEventBridgeForwardInitialRender"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda_forward_initial_render_request.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.s3_put_docx.arn
}
