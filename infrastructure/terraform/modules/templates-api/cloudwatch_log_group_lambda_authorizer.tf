resource "aws_cloudwatch_log_group" "lambda_authorizer" {
  name              = "/aws/lambda/${var.csi}-templates-lambda-authorizer"
  retention_in_days = 30
}
