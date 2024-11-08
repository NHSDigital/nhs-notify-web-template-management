resource "aws_lambda_function" "main" {
  function_name = var.function_name
  role          = aws_iam_role.lambda_execution_role.arn
}
