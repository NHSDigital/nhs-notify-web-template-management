resource "aws_acm_certificate" "files" {
  provider = aws.us-east-1

  domain_name       = local.cloudfront_files_domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "files" {
  provider = aws.us-east-1

  certificate_arn = aws_acm_certificate.files.arn

  validation_record_fqdns = [for record in aws_route53_record.acm_validation_files : record.fqdn]
}
