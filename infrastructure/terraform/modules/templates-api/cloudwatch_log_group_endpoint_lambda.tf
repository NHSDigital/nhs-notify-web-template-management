resource "aws_cloudwatch_log_group" "endpoint_lambda" {
  name              = "/aws/lambda/${local.endpoint_lambda_function_name}"
  retention_in_days = var.log_retention_in_days
}
