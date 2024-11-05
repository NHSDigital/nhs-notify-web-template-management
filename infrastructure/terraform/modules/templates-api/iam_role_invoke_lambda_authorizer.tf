resource "aws_iam_role" "invoke_lambda_authorizer" {
  name               = "${var.csi}-templates-invoke-lambda-authorizer"
  description        = "Role that allows API Gateway to invoke the Lambda function"
  assume_role_policy = data.aws_iam_policy_document.lambda_assumerole.json
}

resource "aws_iam_role_policy" "invoke_lambda_authorizer" {
  role   = aws_iam_role.invoke_lambda_authorizer.name
  name   = "${var.csi}-templates-invoke-lambda-authorizer"
  policy = data.aws_iam_policy_document.invoke_lambda_authorizer.json
}

data "aws_iam_policy_document" "invoke_lambda_authorizer" {
  statement {
    sid    = "AllowInvokeLambda"
    effect = "Allow"

    actions = [
      "lambda:InvokeFunction",
    ]

    resources = [
      "${aws_lambda_function.authorizer.arn}*"
    ]
  }
}
