data "aws_kms_key" "sandbox" {
  key_id = "${var.project}-main-acct-sandbox"
}
