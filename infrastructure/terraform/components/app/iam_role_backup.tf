resource "aws_iam_role" "backup" {
  name               = "${local.csi}-service-role"
  assume_role_policy = data.aws_iam_policy_document.assumerole_backup.json
}

resource "aws_iam_role_policy_attachment" "backup_backup" {
  role       = aws_iam_role.amplify.name
  policy_arn = aws_iam_policy.amplify.arn
}

resource "aws_iam_policy" "backup" {
  name        = "${local.csi}-amplify"
  description = "Amplify "
  policy      = data.aws_iam_policy_document.amplify.json
}

data "aws_iam_policy_document" "backup" {
  statement {
    effect = "Allow"

    actions = [
      "backup:CreateBackupPlan",
      "backup:CreateBackupSelection",
      "backup:CreateBackupVault",
      "backup:CreateFramework",
      "backup:CreateReportPlan",
      "backup:CreateRestoreTestingPlan",
      "backup:DeleteBackupPlan",
      "backup:DeleteBackupSelection",
      "backup:DeleteBackupVault",
      "backup:DeleteFramework",
      "backup:DeleteReportPlan",
      "backup:DeleteRestoreTestingPlan",
      "backup:DescribeBackupPlan",
      "backup:DescribeBackupVault",
      "backup:DescribeFramework",
      "backup:DescribeReportPlan",
      "backup:GetBackupPlan",
      "backup:GetBackupSelection",
      "backup:GetBackupVaultAccessPolicy",
      "backup:GetRestoreTestingPlan",
      "backup:ListBackupPlans",
      "backup:ListBackupVaults",
      "backup:ListFrameworks",
      "backup:ListReportPlans",
      "backup:ListRestoreTestingPlans",
      "backup:ListTags",
      "backup:PutBackupVaultAccessPolicy",
      "backup:TagResource",
      "backup:UpdateBackupPlan",
      "backup:UpdateReportPlan",
      "backup:UpdateRestoreTestingPlan"
    ]

    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = [
      "${aws_cloudwatch_log_group.amplify.arn}:*",
      "${aws_cloudwatch_log_group.amplify.arn}:log-stream:*",
    ]
  }
  statement {
    effect = "Allow"

    actions = [
      "logs:DescribeLogGroups",
    ]

    #tfsec:ignore:aws-iam-no-policy-wildcards
    resources = [
      "arn:aws:logs:${var.region}:${var.aws_account_id}:*"
    ]
  }
}
