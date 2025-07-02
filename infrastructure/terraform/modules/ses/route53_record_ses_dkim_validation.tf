resource "aws_route53_record" "ses_dkim_validation_main" {
  count = 3

  zone_id = var.zone_id
  name    = "${aws_ses_domain_dkim.main.dkim_tokens[count.index]}._domainkey.${aws_ses_domain_identity.main.id}"
  type    = "CNAME"
  ttl     = "300"
  records = [
    "${aws_ses_domain_dkim.main.dkim_tokens[count.index]}.dkim.amazonses.com"
  ]
}
