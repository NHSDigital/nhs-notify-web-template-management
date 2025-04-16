module "lambda_sftp_poll" {
  source      = "../lambda-function"
  description = "Lambda to poll the SFTP suppliers and "

  function_name    = "${local.csi}-sftp-poll"
  filename         = module.build_sftp_letters_lambdas.zips["src/sftp-poll.ts"].path
  source_code_hash = module.build_sftp_letters_lambdas.zips["src/sftp-poll.ts"].base64sha256
  handler          = "sftp-poll.handler"

  log_retention_in_days = var.log_retention_in_days

  execution_role_policy_document = data.aws_iam_policy_document.sftp_poll.json

  environment_variables = {
    CREDENTIALS_TTL_MS      = 900 * 1000
    CSI                     = local.csi
    DEFAULT_LETTER_SUPPLIER = local.default_letter_supplier.name
    ENVIRONMENT             = var.environment
    QUARANTINE_BUCKET_NAME  = module.s3bucket_quarantine.id
    INTERNAL_BUCKET_NAME    = module.s3bucket_internal.id
    NODE_OPTIONS            = "--enable-source-maps",
    REGION                  = var.region
    SEND_LOCK_TTL_MS        = 50 * 1000 // visibility timeout 60s
    SFTP_ENVIRONMENT        = local.sftp_environment
    TEMPLATES_TABLE_NAME    = aws_dynamodb_table.templates.name
  }

  timeout = 20
}

data "aws_iam_policy_document" "sftp_poll" {
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
    sid    = "AllowS3"
    effect = "Allow"

    actions = [
      "s3:PutObject",
      "s3:ListBucket",
    ]

    resources = [module.s3bucket_quarantine.arn, "${module.s3bucket_quarantine.arn}/*"]
  }

  statement {
    sid    = "AllowSSMParameterRead"
    effect = "Allow"
    actions = [
      "ssm:GetParameter",
      "ssm:GetParametersByPath",
    ]
    resources = [
      "arn:aws:ssm:${var.region}:${var.aws_account_id}:parameter/${local.csi}/sftp-config/*",
      "arn:aws:ssm:${var.region}:${var.aws_account_id}:parameter/${local.csi}/sftp-config",
    ]
  }

  statement {
    sid    = "AllowKMSDynamoAccess"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:DescribeKey",
      "kms:Encrypt",
      "kms:GenerateDataKey*",
      "kms:ReEncrypt*",
    ]

    resources = [
      var.kms_key_arn
    ]
  }
}
