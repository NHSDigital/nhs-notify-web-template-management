resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}
