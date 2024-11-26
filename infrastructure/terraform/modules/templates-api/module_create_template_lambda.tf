module "create_template_lambda" {
  source      = "../lambda-function"
  description = "Create template API endpoint"

  function_name    = "${local.csi}-create-template"
  filename         = module.create_template_build.output_path
  source_code_hash = module.create_template_build.base64sha256
  runtime          = "nodejs20.x"
  handler          = "index.create"

  log_retention_in_days = var.log_retention_in_days

  environment_variables = {
    TEMPLATES_TABLE_NAME = aws_dynamodb_table.templates.name
  }

  execution_role_policy_document = data.aws_iam_policy_document.create_template_lambda_dynamo_access.json
}

module "create_template_build" {
  source = "../typescript-build-zip"

  source_code_dir = "${local.lambdas_source_code_dir}/endpoint"
  entrypoint      = "src/index.ts"
}

data "aws_iam_policy_document" "create_template_lambda_dynamo_access" {
  statement {
    sid    = "AllowDynamoAccess"
    effect = "Allow"

    actions = [
      "dynamodb:PutItem",
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
