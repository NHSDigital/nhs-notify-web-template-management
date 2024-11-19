module "templates_api" {
  source = "../../modules/templates-api"

  project               = var.project
  environment           = var.environment
  aws_account_id        = var.aws_account_id
  region                = var.region
  group                 = var.group
  csi                   = local.csi
  log_retention_in_days = var.log_retention_in_days

  cognito_config        = jsondecode(aws_ssm_parameter.cognito_config.value)
}
