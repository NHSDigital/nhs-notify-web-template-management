# TODO: CCM-8418
# tfsec:ignore:aws-iam-no-policy-wildcards
module "backend_api" {
  source = "../../modules/backend-api"

  project               = var.project
  environment           = var.environment
  component             = var.component
  aws_account_id        = var.aws_account_id
  region                = var.region
  group                 = var.group
  csi                   = local.csi
  log_retention_in_days = var.log_retention_in_days
  kms_key_arn           = module.kms.key_arn

  cognito_config = jsondecode(aws_ssm_parameter.cognito_config.value)

  enable_backup = var.destination_vault_arn != null ? true : false

  enable_letters  = var.enable_letters
  enable_proofing = var.enable_proofing
}
