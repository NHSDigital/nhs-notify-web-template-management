resource "aws_iam_policy" "github_deploy_overload" {
  name        = "${local.csi}-github-deploy-overload"
  description = "Overloads the github permission to perform build actions for services in this account"
  policy      = data.aws_iam_policy_document.github_deploy.json
}

resource "aws_iam_role_policy_attachment" "github_deploy_overload" {
  role       = local.bootstrap.iam_github_deploy_role["name"]
  policy_arn = aws_iam_policy.github_deploy_overload.arn
}

#trivy:ignore:aws-iam-no-policy-wildcards Policy voilation expected for CI user role
data "aws_iam_policy_document" "github_deploy" {
  statement {
    effect = "Allow"

    actions = [
      "amplify:*",
      "apigateway:*",
      "appsync:*",
      "backup:*",
      "backup-storage:*",
      "cloudformation:*",
      "cloudfront:*",
      "cognito-idp:*",
      "ecr:*",
      "firehose:*",
      "logs:*",
      "oam:*",
      "pipes:*",
      "ses:*",
      "sns:*",
      "sqs:*",
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"

    actions = [
      "ec2:AllocateAddress",
      "ec2:Associate*",
      "ec2:AttachInternetGateway",
      "ec2:AuthorizeSecurityGroup*",
      "ec2:Create*",
      "ec2:Delete*",
      "ec2:Describe*",
      "ec2:DetachInternetGateway",
      "ec2:Disassociate*",
      "ec2:ModifySubnet*",
      "ec2:ModifyVpc*",
      "ec2:ReleaseAddress",
      "ec2:Replace*",
      "ec2:Revoke*",
    ]
    resources = ["*"]
  }
}
