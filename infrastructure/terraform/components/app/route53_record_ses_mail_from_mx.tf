resource "aws_route53_record" "ses_mail_from_mx" {
  count   = var.override_ses_domain_name == "NA" ? 1 : 0
  zone_id = local.acct.dns_zone["id"]
  name    = aws_ses_domain_mail_from.main.mail_from_domain
  type    = "MX"
  ttl     = "600"
  records = ["10 feedback-smtp.eu-west-2.amazonses.com"]
}
