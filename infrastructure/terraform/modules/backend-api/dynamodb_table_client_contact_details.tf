resource "aws_dynamodb_table" "client_contact_details" {
  name = "${local.csi}-client-contact-details"

  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "owner"
  range_key = "contactDetailKey"

  attribute {
    name = "owner"
    type = "S"
  }

  attribute {
    name = "contactDetailKey"
    type = "S"
  }

  attribute {
    name = "id"
    type = "S"
  }

  global_secondary_index {
    name = "ById"

    key_schema {
      key_type       = "HASH"
      attribute_name = "id"
    }

    key_schema {
      key_type       = "RANGE"
      attribute_name = "owner"
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
