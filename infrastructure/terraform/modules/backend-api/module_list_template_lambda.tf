module "list_template_lambda" {
  depends_on = [module.build_template_lambda, module.build_template_client]

  source      = "../lambda-function"
  description = "List template API endpoint"

  function_name    = "${local.csi}-list-template"
  filename         = module.build_template_lambda.zips[local.backend_lambda_entrypoints.list_template].path
  source_code_hash = module.build_template_lambda.zips[local.backend_lambda_entrypoints.list_template].base64sha256
  runtime          = "nodejs20.x"
  handler          = "list.handler"

  log_retention_in_days = var.log_retention_in_days

  environment_variables = local.backend_lambda_environment_variables

  execution_role_policy_document = data.aws_iam_policy_document.list_template_lambda_policy.json
  cloudwatch_log_destination_arn = var.cloudwatch_log_destination_arn
  log_subscription_role_arn      = var.log_subscription_role_arn
}

data "aws_iam_policy_document" "list_template_lambda_policy" {
  statement {
    sid    = "AllowDynamoAccess"
    effect = "Allow"

    actions = [
      "dynamodb:Query",
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
