module "create_letter_template_lambda" {
  depends_on = [module.build_template_lambda, module.build_template_client]

  source      = "../lambda-function"
  description = "Create letter template API endpoint"

  function_name    = "${local.csi}-create-letter"
  filename         = module.build_template_lambda.zips[local.backend_lambda_entrypoints.create_letter_template].path
  source_code_hash = module.build_template_lambda.zips[local.backend_lambda_entrypoints.create_letter_template].base64sha256
  runtime          = "nodejs20.x"
  handler          = "create-letter.handler"
  memory_size      = 256

  log_retention_in_days = var.log_retention_in_days

  environment_variables = local.backend_lambda_environment_variables

  execution_role_policy_document = data.aws_iam_policy_document.create_letter_template_lambda_policy.json
}

data "aws_iam_policy_document" "create_letter_template_lambda_policy" {
  statement {
    sid    = "AllowDynamoAccess"
    effect = "Allow"

    actions = [
      "dynamodb:PutItem",
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
      local.dynamodb_kms_key_arn,
      var.kms_key_arn
    ]
  }

  statement {
    sid    = "AllowS3Access"
    effect = "Allow"

    actions = [
      "s3:PutObject",
    ]

    resources = [
      "${module.s3bucket_quarantine.arn}/test-data/*",
      "${module.s3bucket_quarantine.arn}/pdf-template/*",
    ]
  }
}
