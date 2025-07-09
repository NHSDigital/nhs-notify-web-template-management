module "sandbox_ses" {
  source = "../../modules/ses"

  count = var.support_sandbox_environments ? 1 : 0

  aws_account_id = var.aws_account_id
  region         = var.region
  project        = var.project
  environment    = var.environment
  component      = var.component

  root_domain_name = "sandbox.${aws_route53_zone.main.name}"

  zone_id = aws_route53_zone.main.id
}
