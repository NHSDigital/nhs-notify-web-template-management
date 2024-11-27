locals {
  authorizer_entrypoint = "src/index.ts"
}

module "authorizer_lambda" {
  source      = "../lambda-function"
  description = "templates api authorizer"

  function_name    = "${local.csi}-authorizer"
  filename         = module.authorizer_build.zips[local.authorizer_entrypoint].path
  source_code_hash = module.authorizer_build.zips[local.authorizer_entrypoint].base64sha256
  runtime          = "nodejs20.x"
  handler          = "index.handler"

  log_retention_in_days = var.log_retention_in_days

  environment_variables = {
    NODE_OPTIONS        = var.enable_sourcemaps ? "--enable-source-maps" : "",
    USER_POOL_ID        = var.cognito_config["USER_POOL_ID"],
    USER_POOL_CLIENT_ID = var.cognito_config["USER_POOL_CLIENT_ID"],
  }
}

module "authorizer_build" {
  source = "../typescript-build-zip"

  source_code_dir    = "${local.lambdas_source_code_dir}/authorizer"
  entrypoints        = [local.authorizer_entrypoint]
  include_sourcemaps = var.enable_sourcemaps
}
