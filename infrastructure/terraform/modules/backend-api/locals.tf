locals {
  csi = "${var.csi}-${var.module}"

  lambdas_dir = "../../../../lambdas"

  lambdas_source_code_dir = abspath("${path.module}/${local.lambdas_dir}")
  pdfjs_layer_zip         = abspath("${local.lambdas_source_code_dir}/layers/pdfjs/dist/layer/pdfjs-layer.zip")
  pdfjs_layer_lockfile    = abspath("${local.lambdas_source_code_dir}/layers/pdfjs/package-lock.json")

  client_ssm_path_prefix = "/${var.csi}/clients"

  openapi_spec = templatefile("${path.module}/spec.tmpl.json", {
    APIG_EXECUTION_ROLE_ARN  = aws_iam_role.api_gateway_execution_role.arn
    AUTHORIZER_LAMBDA_ARN    = module.authorizer_lambda.function_arn
    AWS_REGION               = var.region
    CREATE_LAMBDA_ARN        = module.create_template_lambda.function_arn
    CREATE_LETTER_LAMBDA_ARN = module.create_letter_template_lambda.function_arn
    DELETE_LAMBDA_ARN        = module.delete_template_lambda.function_arn
    GET_CLIENT_LAMBDA_ARN    = module.get_client_lambda.function_arn
    GET_LAMBDA_ARN           = module.get_template_lambda.function_arn
    LIST_LAMBDA_ARN          = module.list_template_lambda.function_arn
    REQUEST_PROOF_LAMBDA_ARN = module.request_proof_lambda.function_arn
    SUBMIT_LAMBDA_ARN        = module.submit_template_lambda.function_arn
    UPDATE_LAMBDA_ARN        = module.update_template_lambda.function_arn
  })

  backend_lambda_environment_variables = {
    CLIENT_CONFIG_SSM_KEY_PREFIX     = local.client_ssm_path_prefix
    DEFAULT_LETTER_SUPPLIER          = local.default_letter_supplier_name
    ENABLE_PROOFING                  = var.enable_proofing
    ENVIRONMENT                      = var.environment
    NODE_OPTIONS                     = "--enable-source-maps"
    REQUEST_PROOF_QUEUE_URL          = module.sqs_sftp_upload.sqs_queue_url
    TEMPLATES_DOWNLOAD_BUCKET_NAME   = module.s3bucket_download.id
    TEMPLATES_INTERNAL_BUCKET_NAME   = module.s3bucket_internal.id
    TEMPLATES_QUARANTINE_BUCKET_NAME = module.s3bucket_quarantine.id
    TEMPLATES_TABLE_NAME             = aws_dynamodb_table.templates.name
  }

  mock_letter_supplier_name = "WTMMOCK"

  use_sftp_letter_supplier_mock = lookup(var.letter_suppliers, local.mock_letter_supplier_name, null) != null

  default_letter_supplier_name = try([
    for k, v in var.letter_suppliers : k if v.default_supplier
  ][0], "")

  sftp_environment = "${var.group}-${var.environment}-${var.component}"
}
