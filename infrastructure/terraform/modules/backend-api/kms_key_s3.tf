resource "aws_kms_key" "s3" {
  description             = "CMK for encrypting s3 data"
  deletion_window_in_days = 14
  enable_key_rotation     = true
}
