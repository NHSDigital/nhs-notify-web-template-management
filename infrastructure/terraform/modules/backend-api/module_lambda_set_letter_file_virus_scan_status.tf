module "lambda_set_file_virus_scan_status" {
  source      = "../lambda-function"
  description = "Sets virus scan status on letter files"

  dead_letter_target_arn         = module.sqs_virus_scan_set_file_status_dlq.sqs_queue_arn
  execution_role_policy_document = data.aws_iam_policy_document.set_file_virus_scan_status.json
  filename                       = module.build_template_lambda.zips[local.backend_lambda_entrypoints.set_file_virus_scan_status].path
  function_name                  = "${local.csi}-set-file-virus-scan-status"
  handler                        = "set-letter-file-virus-scan-status.handler"
  log_retention_in_days          = var.log_retention_in_days
  source_code_hash               = module.build_template_lambda.zips[local.backend_lambda_entrypoints.set_file_virus_scan_status].base64sha256

  environment_variables = local.backend_lambda_environment_variables
}

data "aws_iam_policy_document" "set_file_virus_scan_status" {
  statement {
    sid    = "AllowS3Read"
    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:GetObjectVersion",
    ]

    resources = ["${module.s3bucket_quarantine.arn}/*"]
  }

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
    sid    = "AllowKMSAccessDynamoDB"
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

  statement {
    sid    = "AllowSQSDLQ"
    effect = "Allow"

    actions = [
      "sqs:SendMessage",
    ]

    resources = [
      module.sqs_virus_scan_set_file_status_dlq.sqs_queue_arn,
    ]
  }

  statement {
    sid    = "AllowKMSAccessSQSDLQ"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey",
    ]

    resources = [
      var.kms_key_arn,
    ]
  }

  statement {
    sid    = "AllowEventBridge"
    effect = "Allow"
    actions = [
      "events:PutEvents"
    ]

    resources = [
      data.aws_cloudwatch_event_bus.default.arn
    ]
  }
}
