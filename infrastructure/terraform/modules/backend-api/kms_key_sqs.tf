resource "aws_kms_key" "sqs" {
  description             = "CMK for encrypting SQS data"
  deletion_window_in_days = 14
  enable_key_rotation     = true
}
