resource "aws_kms_key" "dynamo" {
  description             = "CMK for encrypting dynamodb data"
  deletion_window_in_days = 14
  enable_key_rotation     = true
}
