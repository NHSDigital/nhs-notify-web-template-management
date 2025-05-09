module "download_authorizer_lambda" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda?ref=v2.0.2"

  providers = {
    aws = aws.us-east-1
  }

  function_name = "download-authorizer"
  description   = "Download authorizer for s3 origin"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = "us-east-1"
  group          = var.group

  log_retention_in_days = var.log_retention_in_days
  kms_key_arn           = module.kms.key_arn

  iam_policy_document = {
    body = data.aws_iam_policy_document.authorizer.json
  }

  function_s3_bucket      = local.acct.s3_buckets["lambda_function_artefacts"]["id"]
  function_code_base_path = local.aws_lambda_functions_dir_path
  function_code_dir       = "${lambdas_source_code_dir}/download-authorizer/dist"
  function_include_common = true
  function_module_name    = "handler"
  runtime                 = "nodejs20.x"
  memory                  = 128
  timeout                 = 5
  log_level               = var.log_level
  lambda_at_edge          = true

  force_lambda_code_deploy = var.force_lambda_code_deploy
  enable_lambda_insights   = false
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
