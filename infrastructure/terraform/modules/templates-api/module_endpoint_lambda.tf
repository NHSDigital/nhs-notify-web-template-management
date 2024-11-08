module "endpoint_lambda" {
  source      = "../lambda-function"
  description = "templates api endpoint"

  function_name    = "${local.csi}-endpoint"
  filename         = module.endpoint_build.output_path
  source_code_hash = module.endpoint_build.base64sha256
  handler          = "index.handler"

  log_retention_in_days = var.log_retention_in_days
}


module "endpoint_build" {
  source = "../typescript-build-zip"

  source_code_dir = "${local.lambdas_source_code_dir}/endpoint"
  entrypoint      = "src/index.ts"
}

