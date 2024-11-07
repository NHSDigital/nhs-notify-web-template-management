locals {
  csi = "${var.csi}-${var.component}"

  openapi_spec = templatefile("${path.module}/../../../api/spec.json", {
    APIG_EXECUTION_ROLE_ARN = aws_iam_role.api_gateway_execution_role.arn
    AUTHORIZER_LAMBDA_ARN   = aws_lambda_function.authorizer.arn
    ENDPOINT_LAMBDA_ARN     = aws_lambda_function.endpoint.arn
  })
}
