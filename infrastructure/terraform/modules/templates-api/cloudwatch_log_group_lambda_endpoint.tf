resource "aws_cloudwatch_log_group" "lambda_endpoint" {
  name              = "/aws/lambda/${var.csi}-templates-lambda-endpoint"
  retention_in_days = 30
}
