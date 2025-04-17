locals {
  csi = "${var.csi}-${var.module}"

  monorepo_root           = abspath("${path.module}/../../../..")
  lambdas_source_code_dir = abspath("${local.monorepo_root}/lambdas")
  pdfjs_layer_dir         = abspath("${local.lambdas_source_code_dir}/layers/pdfjs")

  openapi_spec = templatefile("${path.module}/spec.tmpl.json", {
    AWS_REGION               = var.region
    APIG_EXECUTION_ROLE_ARN  = aws_iam_role.api_gateway_execution_role.arn
    AUTHORIZER_LAMBDA_ARN    = module.authorizer_lambda.function_arn
    CREATE_LAMBDA_ARN        = module.create_template_lambda.function_arn
    CREATE_LETTER_LAMBDA_ARN = module.create_letter_template_lambda.function_arn
    UPDATE_LAMBDA_ARN        = module.update_template_lambda.function_arn
    SUBMIT_LAMBDA_ARN        = module.submit_template_lambda.function_arn
    DELETE_LAMBDA_ARN        = module.delete_template_lambda.function_arn
    GET_LAMBDA_ARN           = module.get_template_lambda.function_arn
    LIST_LAMBDA_ARN          = module.list_template_lambda.function_arn
  })

  backend_lambda_entrypoints = {
    copy_scanned_object_to_internal = "src/templates/copy-scanned-object-to-internal.ts"
    create_letter_template          = "src/templates/create-letter.ts"
    create_template                 = "src/templates/create.ts"
    delete_failed_scanned_object    = "src/templates/delete-failed-scanned-object.ts"
    delete_template                 = "src/templates/delete.ts"
    get_template                    = "src/templates/get.ts"
    list_template                   = "src/templates/list.ts"
    set_file_virus_scan_status      = "src/templates/set-letter-file-virus-scan-status.ts"
    submit_template                 = "src/templates/submit.ts"
    template_client                 = "src/index.ts"
    update_template                 = "src/templates/update.ts"
    validate_letter_template_files  = "src/templates/validate-letter-template-files.ts"
  }

  backend_lambda_environment_variables = {
    ENABLE_LETTERS_BACKEND           = var.enable_letters
    ENVIRONMENT                      = var.environment
    NODE_OPTIONS                     = "--enable-source-maps"
    TEMPLATES_QUARANTINE_BUCKET_NAME = module.s3bucket_quarantine.id
    TEMPLATES_INTERNAL_BUCKET_NAME   = module.s3bucket_internal.id
    TEMPLATES_TABLE_NAME             = aws_dynamodb_table.templates.name
    ENABLE_PROOFING                  = var.enable_proofing
  }

  dynamodb_kms_key_arn = var.dynamodb_kms_key_arn == "" ? aws_kms_key.dynamo[0].arn : var.dynamodb_kms_key_arn
}
