resource "aws_dynamodb_table" "templates" {
  name         = "${local.csi}-templates"
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
    kms_key_arn = local.dynamodb_kms_key_arn
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
    name               = "QueryById"
    hash_key           = "id"
    projection_type    = "INCLUDE"
    non_key_attributes = ["owner"]
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"
}
