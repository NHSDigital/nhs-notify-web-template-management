resource "aws_route53_record" "ses_dkim_validation" {
  for_each = toset(aws_ses_domain_dkim.main.dkim_tokens)

  zone_id = local.acct.dns_zone["id"]
  name    = "${each.value}._domainkey.${aws_ses_domain_dkim.main.domain}"
  type    = "CNAME"
  ttl     = "300"
  records = [
    "${each.value}.dkim.amazonses.com"
  ]

  depends_on = [
    aws_ses_domain_dkim.main
  ]
}
