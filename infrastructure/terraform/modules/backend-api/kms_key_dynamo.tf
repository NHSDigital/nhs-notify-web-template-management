resource "aws_kms_key" "dynamo" {
  count                   = var.dynamodb_kms_key_arn == "" ? 1 : 0
  description             = "CMK for encrypting dynamodb data"
  deletion_window_in_days = 14
  enable_key_rotation     = true
}
