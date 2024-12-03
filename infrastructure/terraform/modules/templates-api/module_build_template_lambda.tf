module "build_template_lambda" {
  source = "../typescript-build-zip"

  source_code_dir = "${local.lambdas_source_code_dir}/backend-api"
  entrypoints     = [
    "src/templates/api/create.ts",
    "src/templates/api/get.ts",
    "src/templates/api/update.ts"
  ]
}

module "build_template_client" {
  source = "../typescript-build-zip"

  source_code_dir = "${local.lambdas_source_code_dir}/backend-client"
  entrypoints      = ["src/index.ts"]
}
