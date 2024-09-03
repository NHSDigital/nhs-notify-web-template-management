resource "aws_route53_record" "ses_mail_from_mx" {
  zone_id = local.acct.dns_zone["id"]
  name    = aws_ses_domain_mail_from.main.mail_from_domain
  type    = "MX"
  ttl     = "600"
  records = ["10 feedback-smtp.eu-west-2.amazonses.com"] # Change to the region in which `aws_ses_domain_identity.example` is created
}
