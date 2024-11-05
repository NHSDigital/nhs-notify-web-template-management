module "templates_api" {
  source = "../../modules/templates-api"

  csi = local.csi

  environment = var.environment

  aws_account_id = var.aws_account_id
}
