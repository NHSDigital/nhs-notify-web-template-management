data "aws_s3_bucket" "quarantine" {
  bucket = var.quarantine_s3_bucket
}
