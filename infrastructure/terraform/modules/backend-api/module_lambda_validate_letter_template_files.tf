module "lambda_validate_letter_template_files" {
  source      = "../lambda-function"
  description = "Validates content of letter template files"

  environment_variables          = local.backend_lambda_environment_variables
  execution_role_policy_document = data.aws_iam_policy_document.validate_letter_template_files.json
  filename                       = module.build_template_lambda.zips[local.backend_lambda_entrypoints.validate_letter_template_files].path
  function_name                  = "${local.csi}-validate-letter-template-files"
  handler                        = "validate-letter-template-files.handler"
  layer_arns                     = [module.lambda_layer_pdfjs.layer_arn]
  log_retention_in_days          = var.log_retention_in_days
  memory_size                    = 1024
  source_code_hash               = module.build_template_lambda.zips[local.backend_lambda_entrypoints.validate_letter_template_files].base64sha256
  sqs_event_source_mapping = {
    sqs_queue_arn = module.sqs_validate_letter_template_files.sqs_queue_arn
  }
  timeout = 20
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
    sid    = "AllowSQSEventSource"
    effect = "Allow"

    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
    ]

    resources = [
      module.sqs_validate_letter_template_files.sqs_queue_arn
    ]
  }

  statement {
    sid    = "AllowKMSAccessS3SQS"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey",
    ]

    resources = [
      var.kms_key_arn
    ]
  }
}
