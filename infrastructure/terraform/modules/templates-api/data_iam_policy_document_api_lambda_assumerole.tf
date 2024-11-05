data "aws_iam_policy_document" "lambda_assumerole" {
  statement {
    sid    = "ApiGatewayAssumeRole"
    effect = "Allow"

    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type = "Service"

      identifiers = [
        "apigateway.amazonaws.com"
      ]
    }
  }
}
