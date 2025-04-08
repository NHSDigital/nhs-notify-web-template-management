module "lambda_validate_letter_template_files" {
  source      = "../lambda-function"
  description = "Validates content of letter template files"

  dead_letter_target_arn         = module.sqs_validate_letter_template_files_dlq.sqs_queue_arn
  execution_role_policy_document = data.aws_iam_policy_document.validate_letter_template_files.json
  filename                       = module.build_template_lambda.zips[local.backend_lambda_entrypoints.validate_letter_template_files].path
  function_name                  = "${local.csi}-validate-letter-template-files"
  handler                        = "validate-letter-template-files.handler"
  log_retention_in_days          = var.log_retention_in_days
  source_code_hash               = module.build_template_lambda.zips[local.backend_lambda_entrypoints.validate_letter_template_files].base64sha256
  timeout                        = 10
  memory_size                    = 512
  layer_arns                     = [module.lambda_layer_pdfjs.layer_arn]
  environment_variables          = local.backend_lambda_environment_variables
}

data "aws_iam_policy_document" "validate_letter_template_files" {
  statement {
    sid    = "AllowDynamoAccess"
    effect = "Allow"

    actions = [
      "dynamodb:GetItem",
      "dynamodb:UpdateItem",
    ]

    resources = [
      aws_dynamodb_table.templates.arn,
    ]
  }

  statement {
    sid    = "AllowKMSAccessDynamo"
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

  statement {
    sid    = "AllowS3InternalGetObject"
    effect = "Allow"

    actions = [
      "s3:GetObject"
    ]

    resources = ["${module.s3bucket_internal.arn}/*"]
  }

  statement {
    sid    = "AllowKMSAccessSQSS3"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey",
    ]

    resources = [
      var.kms_key_arn
    ]
  }

  statement {
    sid    = "AllowSQSDLQ"
    effect = "Allow"

    actions = [
      "sqs:SendMessage",
    ]

    resources = [
      module.sqs_validate_letter_template_files_dlq.sqs_queue_arn,
    ]
  }
}
