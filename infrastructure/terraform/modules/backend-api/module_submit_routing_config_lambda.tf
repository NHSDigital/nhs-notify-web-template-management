module "submit_routing_config_lambda" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.29/terraform-lambda.zip"

  project        = var.project
  environment    = var.environment
  component      = var.component
  aws_account_id = var.aws_account_id
  region         = var.region

  kms_key_arn = var.kms_key_arn

  function_name = "submit-routing-config"

  function_module_name  = "submit-routing-config"
  handler_function_name = "handler"
  description           = "Submit Routing Config API endpoint"

  memory  = 2048
  timeout = 3
  runtime = "nodejs22.x"

  log_retention_in_days = var.log_retention_in_days

  iam_policy_document = {
    body = data.aws_iam_policy_document.submit_routing_config_lambda_policy.json
  }

  lambda_env_vars         = local.backend_lambda_environment_variables
  function_s3_bucket      = var.function_s3_bucket
  function_code_base_path = local.lambdas_dir
  function_code_dir       = "backend-api/dist/submit-routing-config"

  send_to_firehose          = var.send_to_firehose
  log_destination_arn       = var.log_destination_arn
  log_subscription_role_arn = var.log_subscription_role_arn
}

data "aws_iam_policy_document" "submit_routing_config_lambda_policy" {
  statement {
    sid    = "AllowDynamoAccess"
    effect = "Allow"

    actions = [
      "dynamodb:GetItem",
      "dynamodb:UpdateItem",
    ]

    resources = [
      aws_dynamodb_table.routing_configuration.arn,
    ]
  }

  statement {
    sid    = "AllowConditionCheckDynamoAccess"
    effect = "Allow"

    actions = [
      "dynamodb:ConditionCheckItem",
    ]

    resources = [
      aws_dynamodb_table.templates.arn,
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
      var.kms_key_arn
    ]
  }

  statement {
    sid    = "AllowSSMParameterRead"
    effect = "Allow"

    actions = [
      "ssm:GetParameter",
    ]

    resources = [local.client_ssm_path_pattern]
  }
}
