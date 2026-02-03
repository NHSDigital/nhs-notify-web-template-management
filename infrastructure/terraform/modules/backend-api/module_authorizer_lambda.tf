module "authorizer_lambda" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.29/terraform-lambda.zip"

  project        = var.project
  environment    = var.environment
  component      = var.component
  aws_account_id = var.aws_account_id
  region         = var.region

  kms_key_arn = var.kms_key_arn

  function_name = "authorizer"

  function_module_name  = "index"
  handler_function_name = "handler"
  description           = "templates api authorizer"

  memory  = 512
  timeout = 20
  runtime = "nodejs22.x"

  log_retention_in_days = var.log_retention_in_days

  lambda_env_vars = {
    NODE_OPTIONS        = "--enable-source-maps",
    USER_POOL_ID        = var.cognito_config["USER_POOL_ID"],
    USER_POOL_CLIENT_ID = var.cognito_config["USER_POOL_CLIENT_ID"],
  }
  function_s3_bucket      = var.function_s3_bucket
  function_code_base_path = local.lambdas_dir
  function_code_dir       = "authorizer/dist"

  send_to_firehose          = var.send_to_firehose
  log_destination_arn       = var.log_destination_arn
  log_subscription_role_arn = var.log_subscription_role_arn
}
