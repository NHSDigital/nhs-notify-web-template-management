resource "aws_ses_receipt_rule" "main" {
  name          = "${local.csi}-store-email-sandbox"
  rule_set_name = local.acct_csi
  recipients    = [local.sandbox_letter_supplier_mock_recipient]
  enabled       = true
  scan_enabled  = true
  tls_policy    = "Optional"

  s3_action {
    position          = 1
    bucket_name       = "${local.acct_global_csi}-ses"
    object_key_prefix = "emails-${var.environment}/"
    iam_role_arn      = "arn:aws:iam::${var.aws_account_id}:role/${local.acct_csi}-ses-receipts"
  }
}
