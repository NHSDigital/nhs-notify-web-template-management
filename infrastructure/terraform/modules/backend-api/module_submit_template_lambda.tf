module "submit_template_lambda" {
  depends_on = [module.build_template_lambda, module.build_template_client]

  source      = "../lambda-function"
  description = "Update a template's status to SUBMITTED"

  function_name    = "${local.csi}-submit-template"
  filename         = module.build_template_lambda.zips[local.backend_lambda_entrypoints.submit_template].path
  source_code_hash = module.build_template_lambda.zips[local.backend_lambda_entrypoints.submit_template].base64sha256
  runtime          = "nodejs20.x"
  handler          = "submit.handler"

  log_retention_in_days = var.log_retention_in_days

  environment_variables = local.backend_lambda_environment_variables

  execution_role_policy_document = data.aws_iam_policy_document.submit_template_lambda_policy.json
  log_destination_arn = var.log_destination_arn
  log_subscription_role_arn      = var.log_subscription_role_arn
}

data "aws_iam_policy_document" "submit_template_lambda_policy" {
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
