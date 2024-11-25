module "email_lambda" {
  source      = "../lambda-function"
  description = "templates api endpoint"

  function_name    = "${local.csi}-email"
  filename         = module.endpoint_build.output_path
  source_code_hash = module.endpoint_build.base64sha256
  runtime          = "nodejs20.x"
  handler          = "index.emailHandler"

  log_retention_in_days = var.log_retention_in_days

  environment_variables = {
    TEMPLATES_TABLE_NAME = aws_dynamodb_table.templates.name
    NOTIFY_DOMAIN_NAME = var.email_domain_name
  }

  execution_role_policy_document = data.aws_iam_policy_document.endpoint_lambda_dynamo_access.json
}
