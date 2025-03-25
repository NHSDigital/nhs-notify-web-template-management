module "lambda_set_file_virus_scan_status" {
  source      = "../lambda-function"
  description = "Sets virus scan status on letter files"

  function_name    = "${local.csi}-set-file-virus-scan-status"
  filename         = module.build_template_lambda.zips[local.backend_lambda_entrypoints.set_file_virus_scan_status].path
  source_code_hash = module.build_template_lambda.zips[local.backend_lambda_entrypoints.set_file_virus_scan_status].base64sha256
  handler          = "set-letter-file-virus-scan-status.handler"

  environment_variables = {
    TEMPLATES_TABLE_NAME = aws_dynamodb_table.templates.name
  }


  log_retention_in_days = var.log_retention_in_days

  execution_role_policy_document = data.aws_iam_policy_document.set_file_virus_scan_status.json
}

data "aws_iam_policy_document" "set_file_virus_scan_status" {
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
      local.dynamodb_kms_key_arn,
    ]
  }
}
