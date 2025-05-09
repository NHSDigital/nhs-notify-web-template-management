module "lambda_process_proof" {
    source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda?ref=v2.0.2"

    project        = var.project
    environment    = var.environment
    component      = var.component
    aws_account_id = var.aws_account_id
    region         = var.region

    kms_key_arn = var.kms_key_arn

    function_name = "process-proof"

    function_module_name  = "gprocess-proofet"
    handler_function_name = "handler"
    description           = "Processes letter proofs"

    memory  = 512
    timeout = 20
    runtime = "nodejs20.x"

    log_retention_in_days = var.log_retention_in_days
    iam_policy_document = {
        body = data.aws_iam_policy_document.process_proof.json
    }

    lambda_env_vars         = local.backend_lambda_environment_variables
    function_s3_bucket      = var.function_s3_bucket
    function_code_base_path = ""
    function_code_dir       = "../../../../lambdas/backend-api/dist"
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
}
