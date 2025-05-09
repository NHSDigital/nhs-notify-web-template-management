module "lambda_validate_letter_template_files" {
    source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda?ref=v2.0.2"

    project        = var.project
    environment    = var.environment
    component      = var.component
    aws_account_id = var.aws_account_id
    region         = var.region

    kms_key_arn = var.kms_key_arn

    function_name = "validate-letter-template-files"

    function_module_name  = "validate-letter-template-files"
    handler_function_name = "handler"
    description           = "Validates content of letter template files"

    memory     = 512
    timeout    = 20
    runtime    = "nodejs20.x"
    layers = [aws_lambda_layer_version.lambda_layer_pdfjs.arn]

    log_retention_in_days = var.log_retention_in_days
    iam_policy_document = {
        body = data.aws_iam_policy_document.validate_letter_template_files.json
    }

    lambda_env_vars         = local.backend_lambda_environment_variables
    function_s3_bucket      = var.function_s3_bucket
    function_code_base_path = ""
    function_code_dir       = "../../../../lambdas/backend-api/dist"
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
    sid    = "AllowS3InternalList"
    effect = "Allow"

    actions = [
      "s3:ListBucket",
      "s3:ListBucketVersions",
    ]

    resources = [module.s3bucket_internal.arn]
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
