locals {
  csi = "${var.csi}-${var.component}"

  lambdas_source_code_dir = abspath("${path.module}/../../../../lambdas")

  openapi_spec = templatefile("${path.module}/spec.json", {
    AWS_REGION              = var.region
    APIG_EXECUTION_ROLE_ARN = aws_iam_role.api_gateway_execution_role.arn
    AUTHORIZER_LAMBDA_ARN   = module.authorizer_lambda.function_arn
    ENDPOINT_LAMBDA_ARN     = module.endpoint_lambda.function_arn
  })
}
