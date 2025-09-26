resource "aws_route53_record" "ses_mx_inbound" {
  zone_id = local.root_domain_id
  name    = local.root_domain_name
  type    = "MX"
  ttl     = "600"
  records = ["10 inbound-smtp.eu-west-2.amazonaws.com"]
}
