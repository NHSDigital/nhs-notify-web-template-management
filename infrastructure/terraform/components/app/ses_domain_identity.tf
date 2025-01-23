resource "aws_ses_domain_identity" "main" {
  domain = local.ses_domain_name
}
