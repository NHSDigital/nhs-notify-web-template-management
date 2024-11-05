locals {
  lambda_authorizer_file_path = "${path.module}/../../../api/.build/authorizer.js"
}

resource "aws_lambda_function" "authorizer" {
  description = "Lambda that authorizes requests to each route"


  function_name    = "${var.csi}-templates-lambda-authorizer"
  role             = aws_iam_role.lambda_authorizer
  filename         = local.lambda_authorizer_file_path
  source_code_hash = filebase64sha256(local.lambda_authorizer_file_path)

  handler     = "authorizer.handler"
  runtime     = "nodejs20.x"
  memory_size = 2048
  timeout     = 600

  environment {
    variables = {
      USER_POOL_ID = "placeholder"
    }
  }
}
