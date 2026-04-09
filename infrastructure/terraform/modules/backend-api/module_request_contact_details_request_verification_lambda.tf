module "request_contact_details_verification_lambda" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/3.0.8/terraform-lambda.zip"

  project        = var.project
  environment    = var.environment
  component      = var.component
  aws_account_id = var.aws_account_id
  region         = var.region

  kms_key_arn = var.kms_key_arn

  function_name = "request-contact-details-verification"

  function_module_name  = "request-contact-details-verification"
  handler_function_name = "handler"
  description           = "API endpoint for requesting contact detail verification"

  memory  = 2048
  timeout = 20
  runtime = "nodejs22.x"

  log_retention_in_days = var.log_retention_in_days
  iam_policy_document = {
    body = data.aws_iam_policy_document.request_contact_details_verification.json
  }

  lambda_env_vars         = local.backend_lambda_environment_variables
  function_s3_bucket      = var.function_s3_bucket
  function_code_base_path = local.lambdas_dir
  function_code_dir       = "backend-api/dist/request-contact-details-verification"

  send_to_firehose          = var.send_to_firehose
  log_destination_arn       = var.log_destination_arn
  log_subscription_role_arn = var.log_subscription_role_arn
}

data "aws_iam_policy_document" "request_contact_details_verification" {
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
    sid    = "AllowSSMReadAccess"
    effect = "Allow"

    actions = [
      "ssm:GetParameter",
    ]

    resources = [
      local.client_ssm_path_pattern,
    ]
  }

  statement {
    sid    = "AllowContactDetailsWrite"
    effect = "Allow"

    actions = [
      "dynamodb:PutItem"
    ]

    resources = [aws_dynamodb_table.client_contact_details.arn]
  }
}
