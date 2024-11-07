locals {
  endpoint_lambda_function_name = "${local.csi}-endpoint"
  endpoint_lambda_file_path     = "${path.module}/../../../api/.build/endpoint.js"
}

resource "aws_lambda_function" "endpoint" {
  description = "templates api endpoint"

  function_name    = local.endpoint_lambda_function_name
  role             = aws_iam_role.endpoint_lambda_execution_role.arn
  filename         = local.endpoint_lambda_file_path
  source_code_hash = filebase64sha256(local.endpoint_lambda_file_path)

  handler = "endpoint.handler"
  runtime = "nodejs20.x"
}
