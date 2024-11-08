resource "aws_iam_role" "lambda_execution_role" {
  name               = "${var.function_name}-execution-role"
  description        = "IAM Role for Lambda function ${var.function_name}"
  assume_role_policy = data.aws_iam_policy_document.lambda_service_trust_policy.json
}

resource "aws_iam_role_policy" "lambda_execution_policy" {
  role   = aws_iam_role.lambda_execution_role.name
  name   = "${var.function_name}-execution-policy"
  policy = data.aws_iam_policy_document.lambda_execution_policy.json
}

data "aws_iam_policy_document" "lambda_service_trust_policy" {
  statement {
    sid    = "LambdaAssumeRole"
    effect = "Allow"

    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type = "Service"

      identifiers = [
        "lambda.amazonaws.com"
      ]
    }
  }
}

data "aws_iam_policy_document" "lambda_execution_policy" {
  source_policy_documents = [
    var.execution_role_policy_document
  ]

  statement {
    sid    = "AllowLogs"
    effect = "Allow"

    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]

    resources = [
      "${aws_cloudwatch_log_group.lambda.arn}:log-stream:*",
    ]
  }
}