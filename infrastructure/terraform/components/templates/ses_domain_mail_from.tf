resource "aws_ses_domain_mail_from" "main" {
  domain           = aws_ses_domain_identity.main.domain
  mail_from_domain = "mail.${aws_ses_domain_identity.main.domain}"
}
