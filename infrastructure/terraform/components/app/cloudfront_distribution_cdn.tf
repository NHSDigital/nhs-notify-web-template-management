#trivy:ignore:AVD-AWS-0010 todo?
resource "aws_cloudfront_distribution" "main" {
  provider = aws.us-east-1

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "NHS Notify Template files CDN (${local.csi})"
  default_root_object = "index.html"
  price_class         = "PriceClass_100" # https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-distribution-distributionconfig.html#cfn-cloudfront-distribution-distributionconfig-priceclass

  restrictions {
    geo_restriction {
      restriction_type = "whitelist"
      locations        = ["GB"]
    }
  }

  aliases = [
    local.cloudfront_domain_name
  ]

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cert.arn
    minimum_protocol_version = "TLSv1.2_2021" # Supports 1.2 & 1.3 - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/secure-connections-supported-viewer-protocols-ciphers.html
    ssl_support_method       = "sni-only"
  }

  origin {
    domain_name              = module.backend_api.download_bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.main.id
    origin_id                = "S3-${local.csi}-download"

    custom_header {
      name  = "x-user-pool-id"
      value = jsondecode(aws_ssm_parameter.cognito_config.value)["USER_POOL_ID"]
    }

    custom_header {
      name  = "x-user-pool-client-id"
      value = jsondecode(aws_ssm_parameter.cognito_config.value)["USER_POOL_CLIENT_ID"]
    }
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

    cache_policy_id          = aws_cloudfront_cache_policy.no_cache.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.forward_cookies.id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }
}

resource "aws_cloudfront_cache_policy" "no_cache" {
  name = "no-cache-policy"

  default_ttl = 0
  max_ttl     = 0
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config { cookie_behavior = "none" }
    headers_config { header_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
  }
}

resource "aws_cloudfront_origin_request_policy" "forward_cookies" {
  name = "forward-cookies"
  cookies_config { cookie_behavior = "all" }
  headers_config { header_behavior = "none" }
  query_strings_config { query_string_behavior = "none" }
}
