resource "aws_iam_role" "invoke_lambda_endpoint" {
  name               = "${var.csi}-templates-invoke-lambda-endpoint"
  description        = "Role that allows API Gateway to invoke the Lambda function"
  assume_role_policy = data.aws_iam_policy_document.lambda_assumerole.json
}

resource "aws_iam_role_policy" "invoke_lambda_endpoint" {
  role   = aws_iam_role.invoke_lambda_endpoint.name
  name   = "${var.csi}-templates-invoke-lambda-endpoint"
  policy = data.aws_iam_policy_document.invoke_lambda_endpoint.json
}

data "aws_iam_policy_document" "invoke_lambda_endpoint" {
  statement {
    sid    = "AllowInvokeLambda"
    effect = "Allow"

    actions = [
      "lambda:InvokeFunction",
    ]

    resources = [
      "${aws_lambda_function.endpoint.arn}*"
    ]
  }
}
