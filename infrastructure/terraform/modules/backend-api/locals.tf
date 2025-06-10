locals {
  csi = "${var.csi}-${var.module}"

  lambdas_dir = "../../../../lambdas"

  lambdas_source_code_dir = abspath("${path.module}/${local.lambdas_dir}")
  pdfjs_layer_zip         = abspath("${local.lambdas_source_code_dir}/layers/pdfjs/dist/layer/pdfjs-layer.zip")
  pdfjs_layer_lockfile    = abspath("${local.lambdas_source_code_dir}/layers/pdfjs/package-lock.json")

  openapi_spec = templatefile("${path.module}/spec.tmpl.json", {
    APIG_EXECUTION_ROLE_ARN  = aws_iam_role.api_gateway_execution_role.arn
    AUTHORIZER_LAMBDA_ARN    = module.authorizer_lambda.function_arn
    AWS_REGION               = var.region
    CREATE_LAMBDA_ARN        = module.create_template_lambda.function_arn
    CREATE_LETTER_LAMBDA_ARN = module.create_letter_template_lambda.function_arn
    DELETE_LAMBDA_ARN        = module.delete_template_lambda.function_arn
    GET_LAMBDA_ARN           = module.get_template_lambda.function_arn
    LIST_LAMBDA_ARN          = module.list_template_lambda.function_arn
    REQUEST_PROOF_LAMBDA_ARN = module.request_proof_lambda.function_arn
    SUBMIT_LAMBDA_ARN        = module.submit_template_lambda.function_arn
    UPDATE_LAMBDA_ARN        = module.update_template_lambda.function_arn
  })

  backend_lambda_entrypoints = {
    copy_scanned_object_to_internal       = "src/templates/copy-scanned-object-to-internal.ts"
    create_letter_template                = "src/templates/create-letter.ts"
    create_template                       = "src/templates/create.ts"
    delete_failed_scanned_object          = "src/templates/delete-failed-scanned-object.ts"
    delete_template                       = "src/templates/delete.ts"
    get_template                          = "src/templates/get.ts"
    list_template                         = "src/templates/list.ts"
    request_proof                         = "src/templates/proof.ts"
    set_file_virus_scan_status_for_upload = "src/templates/set-letter-upload-virus-scan-status.ts"
    process_proof                         = "src/templates/process-proof.ts"
    submit_template                       = "src/templates/submit.ts"
    template_client                       = "src/index.ts"
    update_template                       = "src/templates/update.ts"
    validate_letter_template_files        = "src/templates/validate-letter-template-files.ts"
  }

  backend_lambda_environment_variables = {
    DEFAULT_LETTER_SUPPLIER          = local.default_letter_supplier_name
    ENVIRONMENT                      = var.environment
    NODE_OPTIONS                     = "--enable-source-maps"
    REQUEST_PROOF_QUEUE_URL          = module.sqs_sftp_upload.sqs_queue_url
    TEMPLATES_INTERNAL_BUCKET_NAME   = module.s3bucket_internal.id
    TEMPLATES_QUARANTINE_BUCKET_NAME = module.s3bucket_quarantine.id
    TEMPLATES_DOWNLOAD_BUCKET_NAME   = module.s3bucket_download.id
    TEMPLATES_TABLE_NAME             = aws_dynamodb_table.templates.name
    ENABLE_PROOFING                  = var.enable_proofing
  }

  mock_letter_supplier_name = "WTMMOCK"

  use_sftp_letter_supplier_mock = lookup(var.letter_suppliers, local.mock_letter_supplier_name, null) != null

  default_letter_supplier_name = try([
    for k, v in var.letter_suppliers : k if v.default_supplier
  ][0], "")

  sftp_environment = "${var.group}-${var.environment}-${var.component}"
}
