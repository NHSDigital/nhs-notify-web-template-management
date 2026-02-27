resource "aws_dynamodb_table" "letter_variants" {
  name = "${local.csi}-letter-variants"

  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "PK"
  range_key = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "ByScopeIndexPK"
    type = "S"
  }

  attribute {
    name = "ByScopeIndexSK"
    type = "S"
  }

  global_secondary_index {
    name = "ByScope"

    key_schema {
      key_type       = "HASH"
      attribute_name = "ByScopeIndexPK"
    }

    key_schema {
      key_type       = "RANGE"
      attribute_name = "ByScopeIndexSK"
    }

    projection_type = "ALL"
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
}
