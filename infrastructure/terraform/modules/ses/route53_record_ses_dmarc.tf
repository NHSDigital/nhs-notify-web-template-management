resource "aws_route53_record" "ses_dmarc_main" {
  zone_id = var.zone_id
  name    = "_dmarc.${aws_ses_domain_identity.main.id}"
  type    = "TXT"
  ttl     = "300"
  records = [
    "v=DMARC1; p=none;"
  ]
}
