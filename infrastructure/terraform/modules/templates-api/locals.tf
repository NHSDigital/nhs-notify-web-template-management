locals {
  openapi_spec = templatefile("${path.module}/../../../api/spec.json", {
    INVOKE_LAMBDA_ENDPOINT_ROLE_ARN   = aws_iam_role.invoke_lambda_endpoint.arn
    LAMBDA_ENDPOINT_ARN               = aws_lambda_function.endpoint.arn
    INVOKE_LAMBDA_AUTHORIZER_ROLE_ARN = aws_iam_role.invoke_lambda_authorizer.arn
    LAMBDA_AUTHORIZER_ARN             = aws_lambda_function.authorizer.arn
  })
}
