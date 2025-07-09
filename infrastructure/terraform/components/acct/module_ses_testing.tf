module "ses_testing" {
  count = local.use_sftp_letter_supplier_mock ? 1 : 0

  source = "../../modules/acct-ses-testing"

  project        = var.project
  component      = var.component
  aws_account_id = var.aws_account_id
  environment    = var.environment
  group          = var.group
  region         = var.region

  zone_id          = aws_route53_zone.main.id
  root_domain_name = "sandbox.${aws_route53_zone.main.name}"

  kms_key_arn = module.kms_sandbox.0.key_arn
}
