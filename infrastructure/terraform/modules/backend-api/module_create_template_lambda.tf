module "create_template_lambda" {
  depends_on = [module.build_template_lambda, module.build_template_client]

  source      = "../lambda-function"
  description = "Create template API endpoint"

  function_name    = "${local.csi}-create-template"
  filename         = module.build_template_lambda.zips[local.backend_lambda_entrypoints.create_template].path
  source_code_hash = module.build_template_lambda.zips[local.backend_lambda_entrypoints.create_template].base64sha256
  runtime          = "nodejs20.x"
  handler          = "create.handler"

  log_retention_in_days = var.log_retention_in_days

  environment_variables = {
    TEMPLATES_TABLE_NAME = aws_dynamodb_table.templates.name
  }

  execution_role_policy_document = data.aws_iam_policy_document.create_template_lambda_policy.json
}

data "aws_iam_policy_document" "create_template_lambda_policy" {
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
      local.dynamodb_kms_key_arn
    ]
  }
}
