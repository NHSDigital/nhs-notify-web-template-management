module "download_authorizer_lambda" {
  source      = "../../modules/lambda-function"
  description = "templates api download authorizer"

  function_name    = "${local.csi}-download-authorizer"
  filename         = module.download_authorizer_build.zips[local.authorizer_entrypoint].path
  source_code_hash = module.download_authorizer_build.zips[local.authorizer_entrypoint].base64sha256
  runtime          = "nodejs20.x"
  handler          = "index.handler"

  log_retention_in_days = var.log_retention_in_days
  # source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda?ref=v2.0.2"

  # providers = {
  #   aws = aws.us-east-1
  # }

  # function_name = "download-authorizer"
  # description   = "Download authorizer for s3 download bucket"

  # aws_account_id = var.aws_account_id
  # component      = var.component
  # environment    = var.environment
  # project        = var.project
  # region         = "us-east-1"
  # group          = var.group

  # log_retention_in_days = var.log_retention_in_days
  # kms_key_arn           = module.kms.key_arn

  # iam_policy_document = {
  #   body = data.aws_iam_policy_document.authorizer.json
  # }

  # function_s3_bucket       = local.acct.s3_buckets["artefacts"]["id"]
  # function_code_base_path  = local.lambdas_source_code_dir
  # function_code_dir        = "download-authorizer/dist"
  # handler_function_name    = "handler"
  # runtime                  = "nodejs20.x"
  # memory                   = 128
  # timeout                  = 3
  # lambda_at_edge           = true
  # enable_lambda_insights   = false
  # force_lambda_code_deploy = true
}

// temp
module "download_authorizer_build" {
  source = "../../modules/typescript-build-zip"

  source_code_dir = "${local.lambdas_source_code_dir}/authorizer"
  entrypoints     = [local.authorizer_entrypoint]
}

locals {
  authorizer_entrypoint = "src/index.ts"
}

data "aws_iam_policy_document" "authorizer" {
  statement {
    sid    = "KMSPermissions"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey",
    ]

    resources = [
      module.kms.key_arn,
    ]
  }
}
