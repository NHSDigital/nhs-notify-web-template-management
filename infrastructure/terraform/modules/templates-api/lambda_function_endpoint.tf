locals {
  lambda_endpoint_file_path = "${path.module}/../../../api/.build/endpoint.js"
}

resource "aws_lambda_function" "endpoint" {
  description = "Lambda endpoint"


  function_name    = "${var.csi}-templates-lambda-endpont"
  role             = aws_iam_role.lambda_endpoint
  filename         = local.lambda_endpoint_file_path
  source_code_hash = filebase64sha256(local.lambda_endpoint_file_path)

  handler     = "endpoint.handler"
  runtime     = "nodejs20.x"
  memory_size = 2048
  timeout     = 600

  environment {
    variables = {}
  }
}
