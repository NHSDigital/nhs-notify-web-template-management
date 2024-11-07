resource "aws_iam_role" "endpoint_lambda_execution_role" {
  name               = "${local.endpoint_lambda_function_name}-execution-role"
  description        = "IAM Role for Lambda function ${local.endpoint_lambda_function_name}"
  assume_role_policy = data.aws_iam_policy_document.lambda_service_trust_policy.json
}

resource "aws_iam_role_policy" "endpoint_lambda_execution_policy" {
  role   = aws_iam_role.endpoint_lambda_execution_role.name
  name   = "${local.endpoint_lambda_function_name}-execution-policy"
  policy = data.aws_iam_policy_document.authorizer_lambda_execution_policy.json
}

data "aws_iam_policy_document" "endpoint_lambda_execution_policy" {
  statement {
    sid    = "AllowLogs"
    effect = "Allow"

    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]

    resources = [
      "${aws_cloudwatch_log_group.endpoint_lambda.arn}:log-stream:*",
    ]
  }
}
