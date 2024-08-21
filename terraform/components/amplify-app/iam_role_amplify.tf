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

data "aws_iam_policy_document" "amplify_ses" {
  count = var.deploy_ses_email_identity ? 1 : 0

  statement {
    effect  = "Allow"
    actions = [
      "ses:SendEmail",
    ]
    resources = [
      aws_ses_email_identity.test_mailbox[0].arn,
    ]
  }
}
resource "aws_iam_role_policy_attachment" "amplify_standard_policy" {
  role       = aws_iam_role.amplify.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmplifyBackendDeployFullAccess"
}

resource "aws_iam_role_policy_attachment" "amplify_ses_policy" {
  count = var.deploy_ses_email_identity ? 1 : 0

  role       = aws_iam_role.amplify.name
  policy_arn = aws_iam_policy.amplify_ses[0].arn
}

resource "aws_iam_policy" "amplify_ses" {
  count = var.deploy_ses_email_identity ? 1 : 0

  name   = "${local.csi}-amplify-ses"
  policy = data.aws_iam_policy_document.amplify_ses[0].json
}
