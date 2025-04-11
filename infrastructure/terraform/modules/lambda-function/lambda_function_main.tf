resource "aws_lambda_function" "main" {
  description      = var.description
  function_name    = var.function_name
  role             = aws_iam_role.lambda_execution_role.arn
  filename         = var.filename
  source_code_hash = var.source_code_hash
  handler          = var.handler
  runtime          = var.runtime
  memory_size      = var.memory_size
  layers           = var.layer_arns
  timeout          = var.timeout

  environment {
    variables = var.environment_variables
  }

  dynamic "dead_letter_config" {
    for_each = var.dead_letter_target_arn == null ? [] : [true]
    content {
      target_arn = var.dead_letter_target_arn
    }
  }
}
