resource "aws_ses_domain_mail_from" "overload" {
  count = var.ses_overload_domain == null ? 0 : 1

  domain           = aws_ses_domain_identity.overload[0].domain
  mail_from_domain = "mail.${aws_ses_domain_identity.overload[0].domain}"
}
