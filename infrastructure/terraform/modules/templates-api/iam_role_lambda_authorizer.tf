resource "aws_iam_role" "lambda_authorizer" {
  name               = "${var.csi}-templates-lambda-authorizer"
  description        = "IAM Role for authorizer lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_assumerole.json
}

resource "aws_iam_role_policy" "lambda_authorizer" {
  role   = aws_iam_role.lambda_authorizer.name
  name   = "${var.csi}-templates-lambda-authorizer"
  policy = data.aws_iam_policy_document.lambda_authorizer.json
}

data "aws_iam_policy_document" "lambda_authorizer" {
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
      aws_cloudwatch_log_group.lambda_authorizer,
      "${aws_cloudwatch_log_group.lambda_authorizer.arn}:log-stream:*",
    ]
  }
}
