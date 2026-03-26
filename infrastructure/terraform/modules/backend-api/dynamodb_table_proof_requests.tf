resource "aws_dynamodb_table" "proof_requests" {
  name         = "${local.csi}-proof-requests"
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "owner"
  range_key = "id"

  attribute {
    name = "owner"
    type = "S"
  }

  attribute {
    name = "id"
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = var.kms_key_arn
  }

  lifecycle {
    ignore_changes = [
      name,
    ]
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"
}
