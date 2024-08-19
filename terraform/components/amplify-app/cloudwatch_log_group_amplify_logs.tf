resource "aws_cloudwatch_log_group" "amplify_logs" {
  name              = "/aws/amplify/${aws_amplify_app.app.id}"
  retention_in_days = 30
}

resource "aws_iam_policy" "amplify_cloudwatch_access" {
  name        = "${local.csi}-${var.lambda_options.function_name}"
  description = "Permissions provided to event-driven lambda function ${var.lambda_options.function_name}"
  path        = "/"
  policy      = data.aws_iam_policy_document.lambda_function.json
}

data "aws_iam_policy_document" "lambda_function" {
  statement {
    sid    = "AllowLogs"
    effect = "Allow"

    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams",
    ]

    resources = ["${aws_cloudwatch_log_group.amplify_logs.arn}/*"]
  }
}
