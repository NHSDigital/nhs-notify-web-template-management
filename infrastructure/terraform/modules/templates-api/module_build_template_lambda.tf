module "build_template_lambda" {
  source = "../typescript-build-zip"

  source_code_dir = "${local.lambdas_source_code_dir}/backend-api"
  entrypoint      = "src/index.ts"
}

module "build_template_client" {
  source = "../typescript-build-zip"

  source_code_dir = "${local.lambdas_source_code_dir}/backend-client"
  entrypoint      = "src/index.ts"
}
