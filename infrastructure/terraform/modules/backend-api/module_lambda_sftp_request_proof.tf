module "lambda_sftp_request_proof" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.28/terraform-lambda.zip"

  project        = var.project
  environment    = var.environment
  component      = var.component
  aws_account_id = var.aws_account_id
  region         = var.region

  kms_key_arn = var.kms_key_arn

  function_name = "sftp-request-proof"

  function_module_name  = "sftp-request-proof"
  handler_function_name = "handler"
  description           = "Send template and test data to letter supplier via SFTP to request a proof"

  memory  = 512
  timeout = 20
  runtime = "nodejs20.x"

  log_retention_in_days = var.log_retention_in_days
  iam_policy_document = {
    body = data.aws_iam_policy_document.sftp_request_proof.json
  }

  lambda_env_vars = {
    CREDENTIALS_TTL_SECONDS              = 900
    CSI                                  = local.csi
    INTERNAL_BUCKET_NAME                 = module.s3bucket_internal.id
    NODE_OPTIONS                         = "--enable-source-maps",
    REGION                               = var.region
    SEND_LOCK_TTL_MS                     = 50 * 1000 # this must be less than the visibility timeout
    SFTP_ENVIRONMENT                     = local.sftp_environment
    TEMPLATES_TABLE_NAME                 = aws_dynamodb_table.templates.name
    PROOF_REQUESTED_SENDER_EMAIL_ADDRESS = var.proof_requested_sender_email_address
    SUPPLIER_RECIPIENT_EMAIL_ADDRESSES   = jsonencode({ for k, v in var.letter_suppliers : k => v.email_addresses })
  }

  function_s3_bucket      = var.function_s3_bucket
  function_code_base_path = local.lambdas_dir
  function_code_dir       = "sftp-letters/dist"

  vpc_config = {
    subnet_ids         = data.aws_subnets.account_vpc_private_subnets.ids
    security_group_ids = [data.aws_security_group.account_vpc_sg_allow_sftp_egress.id]
  }

  send_to_firehose          = var.send_to_firehose
  log_destination_arn       = var.log_destination_arn
  log_subscription_role_arn = var.log_subscription_role_arn
}

resource "aws_lambda_event_source_mapping" "sftp_request_proof" {
  event_source_arn                   = module.sqs_sftp_upload.sqs_queue_arn
  function_name                      = module.lambda_sftp_request_proof.function_name
  batch_size                         = 5
  maximum_batching_window_in_seconds = 0
  function_response_types = [
    "ReportBatchItemFailures"
  ]

  scaling_config {
    maximum_concurrency = 5
  }
}

data "aws_iam_policy_document" "sftp_request_proof" {
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
    sid    = "AllowS3InternalGet"
    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:GetObjectVersion",
    ]

    resources = ["${module.s3bucket_internal.arn}/*"]
  }

  statement {
    sid    = "AllowS3InternalList"
    effect = "Allow"

    actions = [
      "s3:ListBucket",
    ]

    resources = [module.s3bucket_internal.arn]
  }

  statement {
    sid    = "AllowSSMParameterRead"
    effect = "Allow"
    actions = [
      "ssm:GetParameter",
    ]
    resources = [
      "arn:aws:ssm:${var.region}:${var.aws_account_id}:parameter/${local.csi}/sftp-config/*"
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

  statement {
    sid    = "AllowSQSDLQ"
    effect = "Allow"

    actions = [
      "sqs:SendMessage",
    ]

    resources = [
      module.sqs_sftp_upload.sqs_dlq_arn,
    ]
  }

  statement {
    sid    = "AllowSQSInput"
    effect = "Allow"

    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:ChangeMessageVisibility",
    ]

    resources = [
      module.sqs_sftp_upload.sqs_queue_arn,
    ]
  }

  statement {
    sid    = "AllowKMSAccessGeneral"
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
    sid    = "AllowVPC"
    effect = "Allow"

    actions = [
      "ec2:CreateNetworkInterface",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DeleteNetworkInterface",
      "ec2:DescribeInstances",
      "ec2:AttachNetworkInterface",
    ]

    resources = [
      "*"
    ]
  }

  statement {
    sid    = "AllowSESAccess"
    effect = "Allow"

    actions = ["ses:SendRawEmail"]

    resources = flatten([
      "arn:aws:ses:${var.region}:${var.aws_account_id}:identity/${var.proof_requested_sender_email_address}",
      "arn:aws:ses:${var.region}:${var.aws_account_id}:identity/${var.email_domain}",
      [for k, v in var.letter_suppliers : [for email in v.email_addresses : "arn:aws:ses:${var.region}:${var.aws_account_id}:identity/${email}"]]
    ])
  }
}
