module "lambda_send_letter_proof" {
  source      = "../lambda-function"
  description = "Send proof and test data to letter supplier via SFTP"

  function_name    = "${local.csi}-send-letter-proof"
  filename         = module.build_sftp_letters_lambdas.zips["src/send-proof.ts"].path
  source_code_hash = module.build_sftp_letters_lambdas.zips["src/send-proof.ts"].base64sha256
  handler          = "send-proof.handler"

  memory_size = 512
  timeout     = 20

  log_retention_in_days = var.log_retention_in_days

  execution_role_policy_document = data.aws_iam_policy_document.send_letter_proof.json

  environment_variables = {
    CREDENTIALS_TTL_SECONDS = 900
    CSI                     = local.csi
    INTERNAL_BUCKET_NAME    = module.s3bucket_internal.id
    NODE_OPTIONS            = "--enable-source-maps",
    REGION                  = var.region
    SEND_LOCK_TTL_MS        = 50 * 1000 # this must be less than the visibility timeout
    SFTP_ENVIRONMENT        = local.sftp_environment
    TEMPLATES_TABLE_NAME    = aws_dynamodb_table.templates.name
  }

  sqs_event_source_mapping = {
    sqs_queue_arn = module.sqs_sftp_upload.sqs_queue_arn
    batch_size    = 5
    scaling_config = {
      maximum_concurrency = 5
    }
  }

  vpc = {
    id                 = data.aws_vpc.account_vpc.id
    cidr_block         = data.aws_vpc.account_vpc.cidr_block
    subnet_ids         = data.aws_subnets.account_vpc_private_subnets
    security_group_ids = [aws_security_group.aws_security_group.account_vpc_sg_allow_sftp_egress.id]
  }
}

data "aws_iam_policy_document" "send_letter_proof" {
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
      local.dynamodb_kms_key_arn
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
}
