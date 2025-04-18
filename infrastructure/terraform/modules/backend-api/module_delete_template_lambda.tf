module "delete_template_lambda" {
  depends_on = [module.build_template_lambda, module.build_template_client]

  source      = "../lambda-function"
  description = "Delete a template"

  function_name    = "${local.csi}-delete-template"
  filename         = module.build_template_lambda.zips[local.backend_lambda_entrypoints.delete_template].path
  source_code_hash = module.build_template_lambda.zips[local.backend_lambda_entrypoints.delete_template].base64sha256
  runtime          = "nodejs20.x"
  handler          = "delete.handler"

  log_retention_in_days = var.log_retention_in_days

  environment_variables = {
    TEMPLATES_TABLE_NAME = aws_dynamodb_table.templates.name
  }

  execution_role_policy_document = data.aws_iam_policy_document.delete_template_lambda_policy.json
}

data "aws_iam_policy_document" "delete_template_lambda_policy" {
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
      local.dynamodb_kms_key_arn
    ]
  }
}
