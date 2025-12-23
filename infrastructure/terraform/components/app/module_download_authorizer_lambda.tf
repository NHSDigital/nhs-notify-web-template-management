module "download_authorizer_lambda" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.28/terraform-lambda.zip"

  providers = {
    aws = aws.us-east-1
  }

  function_name = "download-authorizer"
  description   = "Download authorizer for s3 download bucket"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = "us-east-1"
  group          = var.group

  log_retention_in_days = var.log_retention_in_days
  kms_key_arn           = module.kms_us_east_1.key_arn

  iam_policy_document = {
    body = data.aws_iam_policy_document.authorizer.json
  }

  function_s3_bucket      = local.acct.s3_buckets["artefacts_us_east_1"]["id"]
  function_code_base_path = local.lambdas_source_code_dir
  function_code_dir       = "download-authorizer/dist"
  handler_function_name   = "handler"
  runtime                 = "nodejs20.x"
  memory                  = 128
  timeout                 = 3
  lambda_at_edge          = true
  enable_lambda_insights  = false
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
      module.kms_us_east_1.key_arn,
    ]
  }
}
