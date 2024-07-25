resource "aws_iam_role" "amplify" {
  name               = "${local.csi}-amplify"
  assume_role_policy = data.aws_iam_policy_document.amplify_assume_role.json

  description = "Amplify role for ${var.environment}"
}

data "aws_iam_policy_document" "amplify_assume_role" {
  statement {
    sid    = "AmplifyAssumeRole"
    effect = "Allow"

    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type = "Service"

      identifiers = ["amplify.amazonaws.com"]
    }
  }
}
resource "aws_iam_role_policy_attachment" "amplify_standard_policy" {
  role       = aws_iam_role.amplify.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmplifyBackendDeployFullAccess"
}
