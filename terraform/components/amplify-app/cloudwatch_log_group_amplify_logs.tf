resource "aws_cloudwatch_log_group" "amplify_logs" {
  name              = "/aws/amplify/${aws_amplify_app.app.id}"
  retention_in_days = 30
}

resource "aws_iam_policy" "amplify_cloudwatch_access" {
  name        = "${local.csi}-amplify-cloudwatch-access"
  description = "Permissions required to create logs in the ${aws_cloudwatch_log_group.amplify_logs.name} log group"
  path        = "/"
  policy      = data.aws_iam_policy_document.amplify_cloudwatch_access.json
}

data "aws_iam_policy_document" "amplify_cloudwatch_access" {
  statement {
    sid    = "AllowLogs"
    effect = "Allow"

    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DescribeLogGroups",
      "logs:DescribeLogStreams",
    ]

    resources = [aws_cloudwatch_log_group.amplify_logs.arn, "${aws_cloudwatch_log_group.amplify_logs.arn}*"]
  }
}
