resource "aws_ses_domain_dkim" "external" {
  count = var.external_email_domain == null ? 0 : 1

  domain = aws_ses_domain_identity.external[0].domain
}
