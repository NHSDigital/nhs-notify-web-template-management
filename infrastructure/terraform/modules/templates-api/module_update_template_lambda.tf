module "update_template_lambda" {
  source      = "../lambda-function"
  description = "Update template API endpoint"

  function_name    = "${local.csi}-update-template"
  filename         = module.update_lambda_build.output_path
  source_code_hash = module.update_lambda_build.base64sha256
  runtime          = "nodejs20.x"
  handler          = "index.update"

  log_retention_in_days = var.log_retention_in_days

  environment_variables = {
    TEMPLATES_TABLE_NAME = aws_dynamodb_table.templates.name
  }

  execution_role_policy_document = data.aws_iam_policy_document.update_template_lambda_policy.json
}

module "update_lambda_build" {
  source = "../typescript-build-zip"

  source_code_dir = "${local.lambdas_source_code_dir}/endpoint"
  entrypoint      = "src/index.ts"
}

data "aws_iam_policy_document" "update_template_lambda_policy" {
  statement {
    sid    = "AllowDynamoAccess"
    effect = "Allow"

    actions = [
      "dynamodb:UpdateItem",
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
}
