module "get_template_letter_variants_lambda" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.29/terraform-lambda.zip"

  project        = var.project
  environment    = var.environment
  component      = var.component
  aws_account_id = var.aws_account_id
  region         = var.region

  kms_key_arn = var.kms_key_arn

  function_name = "get-template-letter-variants"

  function_module_name  = "get-template-letter-variants"
  handler_function_name = "handler"
  description           = "Get template letter variants API endpoint"

  memory  = 2048
  timeout = 20
  runtime = "nodejs22.x"

  log_retention_in_days = var.log_retention_in_days
  iam_policy_document = {
    body = data.aws_iam_policy_document.get_template_letter_variants_lambda_policy.json
  }

  lambda_env_vars         = local.backend_lambda_environment_variables
  function_s3_bucket      = var.function_s3_bucket
  function_code_base_path = local.lambdas_dir
  function_code_dir       = "backend-api/dist/get-template-letter-variants"

  send_to_firehose          = var.send_to_firehose
  log_destination_arn       = var.log_destination_arn
  log_subscription_role_arn = var.log_subscription_role_arn
}

data "aws_iam_policy_document" "get_template_letter_variants_lambda_policy" {
  statement {
    sid    = "AllowTemplatesUpdate"
    effect = "Allow"

    actions = [
      "dynamodb:GetItem",
    ]

    resources = [
      aws_dynamodb_table.templates.arn,
    ]
  }

  statement {
    sid    = "AllowLetterVariantsQueryByScope"
    effect = "Allow"

    actions = [
      "dynamodb:Query",
    ]

    resources = [
      "${aws_dynamodb_table.letter_variants.arn}/index/ByScope",
    ]
  }
}
