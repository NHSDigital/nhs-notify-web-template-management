module "cognito_triggers" {
  source = "../../modules/cognito-triggers"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  group          = var.group

  function_s3_bucket    = local.acct.s3_buckets["artefacts"]["id"]
  kms_key_arn           = data.aws_kms_key.sandbox.arn
  log_retention_in_days = var.log_retention_in_days
  user_pool_id          = aws_cognito_user_pool.sandbox.id
}
