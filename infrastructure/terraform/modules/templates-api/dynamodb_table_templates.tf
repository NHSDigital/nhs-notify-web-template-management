resource "aws_dynamodb_table" "templates" {
    name = "${local.csi}-templates"
    billing_mode = "PAY_PER_REQUEST"

    hash_key = "owner"
    range_key = "id"

    attribute {
      name = "owner"
      type = "S"
    }

    attribute {
        name = "id"
        type = "S"
    }

    point_in_time_recovery {
      enabled = true
    }

    server_side_encryption {
        enabled     = true
        kms_key_arn = aws_key_key.dynamo.arn
    }
}
