module "build_template_lambda" {
  source = "../typescript-build-zip"

  source_code_dir = "${local.lambdas_source_code_dir}/backend-api"
  entrypoints = [
    local.backend_lambda_entrypoints.copy_scanned_object_to_internal,
    local.backend_lambda_entrypoints.create_letter_template,
    local.backend_lambda_entrypoints.create_template,
    local.backend_lambda_entrypoints.delete_failed_scanned_object,
    local.backend_lambda_entrypoints.delete_template,
    local.backend_lambda_entrypoints.get_template,
    local.backend_lambda_entrypoints.list_template,
    local.backend_lambda_entrypoints.request_proof,
    local.backend_lambda_entrypoints.set_file_virus_scan_status,
    local.backend_lambda_entrypoints.submit_template,
    local.backend_lambda_entrypoints.update_template,
    local.backend_lambda_entrypoints.validate_letter_template_files,
  ]

  externals = ["pdfjs-dist"]
}

module "build_template_client" {
  source = "../typescript-build-zip"

  source_code_dir = "${local.lambdas_source_code_dir}/backend-client"
  entrypoints     = [local.backend_lambda_entrypoints.template_client]
}
