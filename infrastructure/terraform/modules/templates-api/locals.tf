locals {
  csi = "${var.csi}-${var.component}"

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
}
