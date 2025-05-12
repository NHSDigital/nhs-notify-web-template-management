resource "aws_cloudfront_distribution" "main" {
  provider = aws.us-east-1

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "NHS Notify Template files CDN (${local.csi})"
  default_root_object = "index.html"
  # https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-distribution-distributionconfig.html#cfn-cloudfront-distribution-distributionconfig-priceclass
  price_class         = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }

  aliases = [
    local.cloudfront_domain_name
  ]

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cert.arn
    # Supports 1.2 & 1.3 - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/secure-connections-supported-viewer-protocols-ciphers.html
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method       = "sni-only"
  }

  origin {
    domain_name              = module.backend_api.download_bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.main.id
    origin_id                = "S3-${local.csi}-download"
  }

  default_cache_behavior {
    allowed_methods = [
      "GET",
      "HEAD",
      "OPTIONS",
    ]
    cached_methods = [
      "GET",
      "HEAD",
    ]
    target_origin_id = "S3-${local.csi}-download"

    forwarded_values {
      query_string = true
      headers      = ["Origin"]

      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }
}

