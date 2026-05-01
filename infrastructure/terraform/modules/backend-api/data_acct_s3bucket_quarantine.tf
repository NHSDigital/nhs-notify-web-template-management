data "aws_s3_bucket" "quarantine" {
  bucket = "${var.project}-${var.aws_account_id}-${var.region}-main-acct-quarantine"
}
