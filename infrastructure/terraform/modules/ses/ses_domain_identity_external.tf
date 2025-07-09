resource "aws_ses_domain_identity" "external" {
  count = var.external_email_domain == null ? 0 : 1

  domain = var.external_email_domain
}
