# TODO: CCM-8418
# tfsec:ignore:aws-iam-no-policy-wildcards
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = var.log_retention_in_days
}
