module "backend_api" {
  source = "../../modules/backend-api"

  project               = var.project
  environment           = var.environment
  aws_account_id        = var.aws_account_id
  region                = var.region
  group                 = var.group
  csi                   = local.csi
  csi_global            = local.csi_global
  log_retention_in_days = var.log_retention_in_days

  shared_kms_key_arn = module.kms.key_arn

  cognito_config = {
    USER_POOL_ID        = aws_cognito_user_pool.sandbox.id
    USER_POOL_CLIENT_ID = aws_cognito_user_pool_client.sandbox.id
  }

  enable_letters = true
}
