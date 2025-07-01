module "ses" {
  source = "../../modules/ses"

  aws_account_id = var.aws_account_id
  region         = var.region
  project        = var.project
  environment    = var.environment
  component      = var.component

  root_domain_name = local.root_domain_name

  external_email_domain = var.external_email_domain
  zone_id               = local.acct.dns_zone["id"]
}
