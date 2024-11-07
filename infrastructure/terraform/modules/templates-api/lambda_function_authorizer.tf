locals {
  authorizer_lambda_function_name = "${local.csi}-authorizer"
  authorizer_lambda_file_path     = "${path.module}/../../../api/.build/authorizer.js"
}

resource "aws_lambda_function" "authorizer" {
  description = "templates api authorizer"

  function_name    = local.authorizer_lambda_function_name
  role             = aws_iam_role.authorizer_lambda_execution_role.arn
  filename         = local.authorizer_lambda_file_path
  source_code_hash = filebase64sha256(local.authorizer_lambda_file_path)

  handler = "authorizer.handler"
  runtime = "nodejs20.x"
}
