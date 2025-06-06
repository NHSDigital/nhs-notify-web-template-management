resource "aws_route53_record" "acm_validation_files" {
  for_each = {
    for dvo in aws_acm_certificate.files.domain_validation_options :
    dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  type            = each.value.type
  zone_id         = local.acct.dns_zone["id"]
  ttl             = 60
}
