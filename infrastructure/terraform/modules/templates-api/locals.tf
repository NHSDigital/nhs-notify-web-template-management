locals {
  csi = "${var.csi}-${var.component}"

  api_source_code_directory = abspath("${path.module}/../../../../api")

  openapi_spec = templatefile("${local.api_source_code_directory}/spec.json", {
    APIG_EXECUTION_ROLE_ARN = aws_iam_role.api_gateway_execution_role.arn
    AUTHORIZER_LAMBDA_ARN   = module.authorizer_lambda.function_arn
    ENDPOINT_LAMBDA_ARN     = module.endpoint_lambda.function_arn
  })
}
