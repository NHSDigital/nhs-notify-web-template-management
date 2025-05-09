# Origin Access Control for S3
resource "aws_cloudfront_origin_access_control" "main" {
  provider                          = aws.us-east-1

  name                              = "${local.csi}-s3bucket-download"
  description                       = "Origin Access Control for ${module.backend_api.download_bucket_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}
