resource "aws_acm_certificate" "cert" {
  provider = aws.us-east-1

  domain_name       = local.cloudfront_domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "main" {
  provider          = aws.us-east-1

  certificate_arn   = aws_acm_certificate.cert.arn
}
