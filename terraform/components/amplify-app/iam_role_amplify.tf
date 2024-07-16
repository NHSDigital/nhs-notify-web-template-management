resource "aws_iam_role" "amplify" {
    name = "${local.csi}-amplify"
    assume_role_policy = data.aws_iam_policy_document.amplify_assume_role.json
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

resource "aws_iam_policy_attachment" "amplify_standard_policy" {
    name = "${local.csi}-amplify-policy-attachment"
    roles = [aws_iam_role.amplify.arn]
    policy_arn = "arn:aws:iam::aws:policy/service-role/AmplifyBackendDeployFullAccess"
}