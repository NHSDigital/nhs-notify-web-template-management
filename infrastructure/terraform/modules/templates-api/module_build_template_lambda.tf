module "get_template_build" {
  source = "../typescript-build-zip"

  source_code_dir = "${local.lambdas_source_code_dir}/endpoint"
  entrypoint      = "src/index.ts"
}
