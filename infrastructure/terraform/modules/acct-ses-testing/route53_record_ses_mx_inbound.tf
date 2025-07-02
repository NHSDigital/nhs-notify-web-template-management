resource "aws_route53_record" "ses_mx_inbound" {
  zone_id = var.zone_id
  name    = var.root_domain_name
  type    = "MX"
  ttl     = "600"
  records = ["10 inbound-smtp.eu-west-2.amazonaws.com"]
}
