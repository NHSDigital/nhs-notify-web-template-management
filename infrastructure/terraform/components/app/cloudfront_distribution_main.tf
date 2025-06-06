resource "aws_cloudfront_distribution" "main" {
  provider = aws.us-east-1

  enabled         = true
  is_ipv6_enabled = true
  comment         = "NHS Notify templates files CDN (${local.csi})"

  # https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-cloudfront-distribution-distributionconfig.html#cfn-cloudfront-distribution-distributionconfig-priceclass
  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }

  aliases = [
    local.cloudfront_files_domain_name
  ]

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate_validation.files.certificate_arn
    # Supports 1.2 & 1.3 - https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/secure-connections-supported-viewer-protocols-ciphers.html
    minimum_protocol_version = "TLSv1.2_2021"
    ssl_support_method       = "sni-only"
  }

  logging_config {
    bucket          = module.s3bucket_cf_logs.bucket_regional_domain_name
    include_cookies = false
  }

  origin {
    domain_name              = module.backend_api.download_bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.s3.id
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

    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    cache_policy_id          = data.aws_cloudfront_cache_policy.caching_disabled.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.forward_cookies.id


    lambda_function_association {
      lambda_arn = module.download_authorizer_lambda.function_qualified_arn
      event_type = "origin-request"
    }
  }
}

data "aws_cloudfront_cache_policy" "caching_disabled" {
  name = "Managed-CachingDisabled"
}

resource "aws_cloudfront_origin_request_policy" "forward_cookies" {
  name = "${local.csi}-forward-cookies"
  cookies_config { cookie_behavior = "all" }
  headers_config { header_behavior = "none" }
  query_strings_config { query_string_behavior = "none" }
}
