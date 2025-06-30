resource "aws_route53_record" "ses_mx_inbound" {
  count = var.use_sftp_letter_supplier_mock ? 1 : 0

  zone_id = var.zone_id
  name    = aws_ses_domain_identity.main.domain
  type    = "MX"
  ttl     = "600"
  records = ["10 inbound-smtp.eu-west-2.amazonaws.com"]
}
