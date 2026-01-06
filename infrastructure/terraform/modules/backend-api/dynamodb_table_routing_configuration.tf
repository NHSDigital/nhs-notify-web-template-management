resource "aws_dynamodb_table" "routing_configuration" {
  name         = "${local.csi}-routing-configuration"
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

  tags = {
    "NHSE-Enable-Dynamo-Backup" = var.enable_backup ? "True" : "False"
  }

  lifecycle {
    ignore_changes = [
      name, # To support backup and restore which will result in a new name otherwise
    ]
  }

  global_secondary_index {
    name            = "QueryById"
    hash_key        = "id"
    projection_type = "KEYS_ONLY"
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"
}
