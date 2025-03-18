locals {
  csi = "${var.csi}-${var.module}"

  lambdas_source_code_dir = abspath("${path.module}/../../../../lambdas")

  openapi_spec = templatefile("${path.module}/spec.tmpl.json", {
    AWS_REGION              = var.region
    APIG_EXECUTION_ROLE_ARN = aws_iam_role.api_gateway_execution_role.arn
    AUTHORIZER_LAMBDA_ARN   = module.authorizer_lambda.function_arn
    CREATE_LAMBDA_ARN       = module.create_template_lambda.function_arn
    UPDATE_LAMBDA_ARN       = module.update_template_lambda.function_arn
    GET_LAMBDA_ARN          = module.get_template_lambda.function_arn
    LIST_LAMBDA_ARN         = module.list_template_lambda.function_arn
  })

  backend_lambda_entrypoints = {
    create_template = "src/templates/api/create.ts"
    get_template    = "src/templates/api/get.ts"
    update_template = "src/templates/api/update.ts"
    list_template   = "src/templates/api/list.ts"
    template_client = "src/index.ts"
  }

  dynamodb_kms_key_arn = var.dynamodb_kms_key_arn == "" ? aws_kms_key.dynamo[0].arn : var.dynamodb_kms_key_arn
}
