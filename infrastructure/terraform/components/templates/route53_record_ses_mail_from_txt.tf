resource "aws_route53_record" "ses_mail_from_txt" {
  zone_id = local.acct.dns_zone["id"]
  name    = aws_ses_domain_mail_from.main.mail_from_domain
  type    = "TXT"
  ttl     = "600"
  records = ["v=spf1 include:amazonses.com -all"]
}
