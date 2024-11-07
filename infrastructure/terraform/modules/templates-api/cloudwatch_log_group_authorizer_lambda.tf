resource "aws_cloudwatch_log_group" "authorizer_lambda" {
  name              = "/aws/lambda/${local.authorizer_lambda_function_name}"
  retention_in_days = var.log_retention_in_days
}
