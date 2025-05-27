module "backend_api" {
  source = "../../modules/backend-api"

  project                 = var.project
  environment             = var.environment
  component               = var.component
  aws_account_id          = var.aws_account_id
  region                  = var.region
  group                   = var.group
  csi                     = local.csi
  log_retention_in_days   = var.log_retention_in_days
  parent_acct_environment = var.parent_acct_environment
  function_s3_bucket      = local.acct.s3_buckets["artefacts"]["id"]

  cognito_config = {
    USER_POOL_ID        = aws_cognito_user_pool.sandbox.id
    USER_POOL_CLIENT_ID = aws_cognito_user_pool_client.sandbox.id
  }

  enable_proofing  = true
  letter_suppliers = var.letter_suppliers

  kms_key_arn          = data.aws_kms_key.sandbox.arn
  dynamodb_kms_key_arn = data.aws_kms_key.sandbox.arn

  send_to_firehose = false
}
