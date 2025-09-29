module "ses" {
  source = "../../modules/ses"

  aws_account_id = var.aws_account_id
  region         = var.region
  project        = var.project
  environment    = var.environment
  component      = local.component

  root_domain_name = local.root_domain_name
  zone_id          = local.root_domain_id

  external_email_domain = var.external_email_domain
}
