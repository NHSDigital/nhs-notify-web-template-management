locals {
  csi = "${var.csi}-${var.module}"

  lambdas_source_code_dir = abspath("${path.module}/../../../../lambdas")

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
    create_letter_template     = "src/templates/create-letter.ts"
    create_template            = "src/templates/create.ts"
    delete_template            = "src/templates/delete.ts"
    get_template               = "src/templates/get.ts"
    list_template              = "src/templates/list.ts"
    set_file_virus_scan_status = "src/templates/set-letter-file-virus-scan-status.ts"
    submit_template            = "src/templates/submit.ts"
    template_client            = "src/index.ts"
    update_template            = "src/templates/update.ts"
  }

  dynamodb_kms_key_arn = var.dynamodb_kms_key_arn == "" ? aws_kms_key.dynamo[0].arn : var.dynamodb_kms_key_arn

  mock_letter_supplier_name     = "WTMMOCK"
  use_sftp_letter_supplier_mock = lookup(var.letter_suppliers, local.mock_letter_supplier_name, null) != null
  default_letter_supplier = [
    for k, v in var.letter_suppliers : merge(v, { name = k }) if v.default_supplier
  ][0]
}
