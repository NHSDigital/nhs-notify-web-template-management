module "authorizer_lambda" {
  source      = "../lambda-function"
  description = "templates api authorizer"

  function_name    = "${local.csi}-authorizer"
  filename         = module.authorizer_build.output_path
  source_code_hash = module.authorizer_build.base64sha256
  runtime          = "nodejs20.x"
  handler          = "index.handler"

  log_retention_in_days = var.log_retention_in_days

  environment_variables = var.cognito_config
}

module "authorizer_build" {
  source = "../typescript-build-zip"

  source_code_dir = "${local.lambdas_source_code_dir}/authorizer"
  entrypoint      = "src/index.ts"
}
