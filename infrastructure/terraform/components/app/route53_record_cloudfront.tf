resource "aws_route53_record" "cloudfront" {
  zone_id = aws_route53_record.root.zone_id
  name    = local.cloudfront_domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}
