module "build_template_lambda" {
  source = "../typescript-build-zip"

  source_code_dir = "${local.lambdas_source_code_dir}/backend-api"
  entrypoints     = [
    local.backend_lambda_entrypoints.create_template,
    local.backend_lambda_entrypoints.get_template,
    local.backend_lambda_entrypoints.update_template,
    local.backend_lambda_entrypoints.list_template,
    local.backend_lambda_entrypoints.send_email,
  ]
}

module "build_template_client" {
  source = "../typescript-build-zip"

  source_code_dir = "${local.lambdas_source_code_dir}/backend-client"
  entrypoints      = [local.backend_lambda_entrypoints.template_client]
}
