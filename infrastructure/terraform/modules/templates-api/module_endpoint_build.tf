module "endpoint_build" {
  source = "../typescript-build-zip"

  source_code_dir = "${local.lambdas_source_code_dir}/endpoint"
  entrypoints     = [local.endpoint_entrypoint]
}

data "aws_iam_policy_document" "endpoint_lambda_dynamo_access" {
  statement {
    sid    = "AllowDynamoAccess"
    effect = "Allow"

    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:Query"
    ]

    resources = [
      aws_dynamodb_table.templates.arn,
    ]
  }

  statement {
    sid    = "AllowKMSAccess"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:DescribeKey",
      "kms:Encrypt",
      "kms:GenerateDataKey*",
      "kms:ReEncrypt*",
    ]

    resources = [
      aws_kms_key.dynamo.arn
    ]
  }

  statement {
    sid  = "AllowSESAccess"
    effect = "Allow"

    actions = ["ses:SendRawEmail"]

    resources = ["arn:aws:ses:eu-west-2:${var.aws_account_id}:identity/*"]
  }
}
