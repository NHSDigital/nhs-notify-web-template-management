resource "aws_route53_record" "ses_validation" {
  count   = var.override_ses_domain_name == "NA" ? 1 : 0
  zone_id = local.acct.dns_zone["id"]
  name    = "_amazonses.${aws_ses_domain_identity.main.id}"
  type    = "TXT"
  ttl     = "300"
  records = [
    aws_ses_domain_identity.main.verification_token
  ]
}
