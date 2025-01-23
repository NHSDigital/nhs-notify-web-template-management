module "email_lambda" {
  depends_on = [module.build_template_lambda, module.build_template_client]

  source      = "../lambda-function"
  description = "Send an email to the recipient"

  function_name    = "${local.csi}-email"
  filename         = module.build_template_lambda.zips[local.backend_lambda_entrypoints.send_email].path
  source_code_hash = module.build_template_lambda.zips[local.backend_lambda_entrypoints.send_email].base64sha256
  runtime          = "nodejs20.x"
  handler          = "handler.emailHandler"

  log_retention_in_days = var.log_retention_in_days

  environment_variables = {
    TEMPLATES_TABLE_NAME = aws_dynamodb_table.templates.name
    SENDER_EMAIL         = "no-reply@${var.email_domain_name}"
  }

  execution_role_policy_document = data.aws_iam_policy_document.email_lambda.json
}

data "aws_iam_policy_document" "email_lambda" {
  statement {
    sid    = "AllowDynamoAccess"
    effect = "Allow"

    actions = [
      "dynamodb:GetItem"
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
    sid    = "AllowSESAccess"
    effect = "Allow"

    actions = ["ses:SendRawEmail"]

    resources = ["arn:aws:ses:eu-west-2:${var.aws_account_id}:identity/*"]
  }
}
