resource "aws_iam_role" "lambda_endpoint" {
  name               = "${var.csi}-templates-lambda-endpoint"
  description        = "IAM Role for endpoint lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_assumerole.json
}

resource "aws_iam_role_policy" "lambda_endpoint" {
  role   = aws_iam_role.lambda_endpoint.name
  name   = "${var.csi}-templates-lambda-endpoint"
  policy = data.aws_iam_policy_document.lambda_endpoint.json
}

data "aws_iam_policy_document" "lambda_endpoint" {
  statement {
    sid    = "AllowLogs"
    effect = "Allow"

    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams",
    ]

    resources = [
      aws_cloudwatch_log_group.lambda_endpoint,
      "${aws_cloudwatch_log_group.lambda_endpoint.arn}:log-stream:*",
    ]
  }
}
