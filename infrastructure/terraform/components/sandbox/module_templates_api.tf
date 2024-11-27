module "templates_api" {
  source = "../../modules/templates-api"

  project               = var.project
  environment           = var.environment
  aws_account_id        = var.aws_account_id
  region                = var.region
  group                 = var.group
  csi                   = local.csi
  log_retention_in_days = var.log_retention_in_days
  cognito_config = {
    USER_POOL_ID        = aws_cognito_user_pool.sandbox.id
    USER_POOL_CLIENT_ID = aws_cognito_user_pool_client.sandbox.id
  }
  enable_sourcemaps = true
}
