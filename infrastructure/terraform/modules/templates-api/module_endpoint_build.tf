module "endpoint_build" {
  source = "../typescript-build-zip"

  source_code_dir = "${local.lambdas_source_code_dir}/endpoint"
  entrypoints     = [local.endpoint_entrypoint]
}

locals {
  endpoint_entrypoint = "src/index.ts"
}
