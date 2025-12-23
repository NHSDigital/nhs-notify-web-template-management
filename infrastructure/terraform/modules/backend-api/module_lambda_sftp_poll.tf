module "lambda_sftp_poll" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.28/terraform-lambda.zip"

  project        = var.project
  environment    = var.environment
  component      = var.component
  aws_account_id = var.aws_account_id
  region         = var.region

  kms_key_arn = var.kms_key_arn

  function_name = "sftp-poll"

  function_module_name  = "sftp-poll"
  handler_function_name = "handler"
  description           = "Lambda to poll the SFTP suppliers and copy proofs to the quarantine bucket"

  memory  = 512
  timeout = 20
  runtime = "nodejs20.x"

  log_retention_in_days = var.log_retention_in_days
  iam_policy_document = {
    body = data.aws_iam_policy_document.sftp_poll.json
  }

  lambda_env_vars = {
    CREDENTIALS_TTL_SECONDS = 900
    CSI                     = local.csi
    QUARANTINE_BUCKET_NAME  = module.s3bucket_quarantine.id
    NODE_OPTIONS            = "--enable-source-maps",
    REGION                  = var.region
    SFTP_ENVIRONMENT        = local.sftp_environment
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

data "aws_iam_policy_document" "sftp_poll" {

  statement {
    sid    = "AllowS3"
    effect = "Allow"

    actions = [
      "s3:PutObject",
    ]

    resources = ["${module.s3bucket_quarantine.arn}/*"]
  }

  statement {
    sid    = "AllowSSMParameterRead"
    effect = "Allow"
    actions = [
      "ssm:GetParameter",
    ]
    resources = [
      "arn:aws:ssm:${var.region}:${var.aws_account_id}:parameter/${local.csi}/sftp-config/*",
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
      var.kms_key_arn
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
}
