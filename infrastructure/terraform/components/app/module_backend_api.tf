module "backend_api" {
  source = "../../modules/backend-api"

  project               = var.project
  environment           = var.environment
  aws_account_id        = var.aws_account_id
  region                = var.region
  group                 = var.group
  csi                   = local.csi
  log_retention_in_days = var.log_retention_in_days
  email_domain_name     = local.ses_domain_name

  cognito_config = jsondecode(data.aws_ssm_parameter.cognito_config.value)
}
