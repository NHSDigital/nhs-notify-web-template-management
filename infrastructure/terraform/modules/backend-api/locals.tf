locals {
  csi = "${var.csi}-${var.component}"

  lambdas_source_code_dir = abspath("${path.module}/../../../../lambdas")

  openapi_spec = templatefile("${path.module}/spec.tmpl.json", {
    AWS_REGION               = var.region
    APIG_EXECUTION_ROLE_ARN  = aws_iam_role.api_gateway_execution_role.arn
    AUTHORIZER_LAMBDA_ARN    = module.authorizer_lambda.function_arn
    CREATE_LAMBDA_ARN        = module.create_template_lambda.function_arn
    CREATE_LETTER_LAMBDA_ARN = module.create_letter_template_lambda.function_arn
    UPDATE_LAMBDA_ARN        = module.update_template_lambda.function_arn
    GET_LAMBDA_ARN           = module.get_template_lambda.function_arn
    LIST_LAMBDA_ARN          = module.list_template_lambda.function_arn
  })

  backend_lambda_entrypoints = {
    create_template                 = "src/templates/create.ts"
    create_letter_template          = "src/templates/create-letter.ts"
    get_template                    = "src/templates/get.ts"
    update_template                 = "src/templates/update.ts"
    list_template                   = "src/templates/list.ts"
    set_file_virus_scan_status      = "src/templates/set-letter-file-virus-scan-status.ts"
    copy_scanned_object_to_internal = "src/templates/copy-scanned-object-to-internal.ts"
    delete_failed_scanned_object    = "src/templates/delete-failed-scanned-object.ts"
    template_client                 = "src/index.ts"
  }

  backend_lambda_environment_variables = {
    ENABLE_LETTERS_BACKEND           = var.enable_letters
    ENVIRONMENT                      = var.environment
    NODE_OPTIONS                     = "--enable-source-maps"
    TEMPLATES_QUARANTINE_BUCKET_NAME = module.s3bucket_quarantine.id
    TEMPLATES_INTERNAL_BUCKET_NAME   = module.s3bucket_internal.id
    TEMPLATES_EVENT_BUS_NAME         = data.aws_cloudwatch_event_bus.default.name
    TEMPLATES_EVENT_SOURCE           = local.event_source
    TEMPLATES_TABLE_NAME             = aws_dynamodb_table.templates.name
  }

  dynamodb_kms_key_arn = var.dynamodb_kms_key_arn == "" ? aws_kms_key.dynamo[0].arn : var.dynamodb_kms_key_arn

  event_source = "templates.${var.environment}.${var.project}"
}
