module "lambda_letter_preview_renderer" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.32/terraform-lambda.zip"

  project        = var.project
  environment    = var.environment
  component      = var.component
  aws_account_id = var.aws_account_id
  region         = var.region
  group          = var.group

  function_name = "letter-preview-renderer"
  description   = "Letter preview renderer Lambda"

  iam_policy_document = {
    body = data.aws_iam_policy_document.letter_preview_renderer.json
  }

  kms_key_arn = var.kms_key_arn

  package_type           = "Image"
  image_uri              = "${var.aws_account_id}.dkr.ecr.${var.region}.amazonaws.com/${var.project}-${var.parent_acct_environment}-acct@${data.aws_ecr_image.letter_preview_renderer.image_digest}"
  image_repository_names = ["${var.project}-${var.parent_acct_environment}-acct"]

  memory  = 4096
  timeout = 60

  lambda_env_vars = {
    DOWNLOAD_BUCKET_NAME = module.s3bucket_download.id
    INTERNAL_BUCKET_NAME = module.s3bucket_internal.id
    NODE_OPTIONS         = "--enable-source-maps",
    REGION               = var.region
    TEMPLATES_TABLE_NAME = aws_dynamodb_table.templates.name
  }

  send_to_firehose          = var.send_to_firehose
  log_destination_arn       = var.log_destination_arn
  log_retention_in_days     = var.log_retention_in_days
  log_subscription_role_arn = var.log_subscription_role_arn
}

resource "aws_lambda_event_source_mapping" "letter_preview_renderer" {
  event_source_arn = module.sqs_letter_render.sqs_queue_arn
  function_name    = module.letter_preview_renderer_lambda.function_name
  batch_size       = 1

  scaling_config {
    maximum_concurrency = 5
  }
}

data "aws_iam_policy_document" "letter_preview_renderer" {
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
    sid    = "AllowS3InternalGetObject"
    effect = "Allow"

    actions = [
      "s3:GetObject"
    ]

    resources = ["${module.s3bucket_internal.arn}/*"]
  }

  statement {
    sid    = "AllowS3DownloadPutObject"
    effect = "Allow"

    actions = [
      "s3:PutObject"
    ]

    resources = ["${module.s3bucket_download.arn}/*"]
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
      module.sqs_letter_render.sqs_queue_arn
    ]
  }

  statement {
    sid    = "AllowKMSAccess"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:DescribeKey",
      "kms:Encrypt",
      "kms:GenerateDataKey",
      "kms:ReEncrypt*",
    ]

    resources = [
      var.kms_key_arn
    ]
  }
}

data "aws_ecr_image" "letter_preview_renderer" {
  registry_id     = var.aws_account_id
  repository_name = "${var.project}-${var.parent_acct_environment}-acct"
  image_tag       = "${var.project}-${var.environment}-${var.component}-letter-preview-renderer-latest"
}
