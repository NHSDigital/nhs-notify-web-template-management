module "lambda_process_proof" {
  source      = "../lambda-function"
  description = "Sets virus scan status on letter files"

  dead_letter_target_arn         = module.sqs_process_proof_dlq.sqs_queue_arn
  execution_role_policy_document = data.aws_iam_policy_document.process_proof.json
  filename                       = module.build_template_lambda.zips[local.backend_lambda_entrypoints.process_proof].path
  function_name                  = "${local.csi}-process-proof"
  handler                        = "process-proof.handler"
  log_retention_in_days          = var.log_retention_in_days
  source_code_hash               = module.build_template_lambda.zips[local.backend_lambda_entrypoints.process_proof].base64sha256

  environment_variables = local.backend_lambda_environment_variables

  timeout                        = 30
  memory_size                    = 512
  cloudwatch_log_destination_arn = var.cloudwatch_log_destination_arn
  log_subscription_role_arn      = var.log_subscription_role_arn
}

data "aws_iam_policy_document" "process_proof" {
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
    sid    = "AllowDynamoGSIAccess"
    effect = "Allow"

    actions = [
      "dynamodb:Query",
    ]

    resources = [
      "${aws_dynamodb_table.templates.arn}/index/QueryById",
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
      module.sqs_process_proof_dlq.sqs_queue_arn,
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
    sid    = "AllowS3QuarantineGetObject"
    effect = "Allow"

    actions = [
      "s3:ListBucket",
      "s3:GetObject",
      "s3:GetObjectVersion",
      "s3:GetObjectTagging",
      "s3:GetObjectVersionTagging",
    ]

    resources = ["${module.s3bucket_quarantine.arn}/*"]
  }

  statement {
    sid    = "AllowS3InternalWrite"
    effect = "Allow"

    actions = [
      "s3:PutObject",
      "s3:PutObjectVersion",
      "s3:PutObjectTagging",
      "s3:PutObjectVersionTagging",
    ]

    resources = ["${module.s3bucket_internal.arn}/*"]
  }

  statement {
    sid    = "AllowS3DownloadWrite"
    effect = "Allow"

    actions = [
      "s3:PutObject",
      "s3:PutObjectVersion",
      "s3:PutObjectTagging",
      "s3:PutObjectVersionTagging",
    ]

    resources = ["${module.s3bucket_download.arn}/*"]
  }
}
