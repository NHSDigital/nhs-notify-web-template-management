module "lambda_sftp_poll" {
  source      = "../lambda-function"
  description = "Lambda to poll the SFTP suppliers and copy proofs to the quarantine bucket"

  function_name    = "${local.csi}-sftp-poll"
  filename         = module.build_sftp_letters_lambdas.zips["src/sftp-poll.ts"].path
  source_code_hash = module.build_sftp_letters_lambdas.zips["src/sftp-poll.ts"].base64sha256
  handler          = "sftp-poll.handler"

  log_retention_in_days = var.log_retention_in_days

  execution_role_policy_document = data.aws_iam_policy_document.sftp_poll.json

  environment_variables = {
    CREDENTIALS_TTL_SECONDS = 900
    CSI                     = local.csi
    QUARANTINE_BUCKET_NAME  = module.s3bucket_quarantine.id
    NODE_OPTIONS            = "--enable-source-maps",
    REGION                  = var.region
    SFTP_ENVIRONMENT        = local.sftp_environment
  }

  timeout     = 60 * 10
  memory_size = 2048

  vpc = {
    id                 = data.aws_vpc.account_vpc.id
    cidr_block         = data.aws_vpc.account_vpc.cidr_block
    subnet_ids         = data.aws_subnets.account_vpc_private_subnets.ids
    security_group_ids = [data.aws_security_group.account_vpc_sg_allow_sftp_egress.id]
  }
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
}
