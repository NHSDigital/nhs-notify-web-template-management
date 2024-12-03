module "build_template_lambda" {
  source = "../typescript-build-zip"

  source_code_dir = "${local.lambdas_source_code_dir}/backend-api"
  entrypoints     = [
    var.template_api_entrypoints.create_template,
    var.template_api_entrypoints.get_template,
    var.template_api_entrypoints.update_template,
    var.template_api_entrypoints.list_template,
  ]
}

module "build_template_client" {
  source = "../typescript-build-zip"

  source_code_dir = "${local.lambdas_source_code_dir}/backend-client"
  entrypoints      = [var.template_api_entrypoints.template_client]
}
