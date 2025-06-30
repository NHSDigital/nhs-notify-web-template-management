resource "aws_ses_receipt_rule_set" "main" {
  count = var.use_sftp_letter_supplier_mock ? 1 : 0

  rule_set_name = local.csi
}

resource "aws_ses_receipt_rule" "store_email" {
  count = var.use_sftp_letter_supplier_mock ? 1 : 0

  name          = "${local.csi}-store-email"
  rule_set_name = aws_ses_receipt_rule_set.main.0.rule_set_name
  recipients    = ["template-submitted-recipient@${aws_ses_domain_identity.main.domain}"]
  enabled       = true
  scan_enabled  = true
  tls_policy    = "Optional"

  s3_action {
    position          = 1
    bucket_name       = module.s3bucket_ses.0.id
    object_key_prefix = "emails/"
    iam_role_arn      = aws_iam_role.ses_receipts.0.arn
  }
}

resource "aws_ses_active_receipt_rule_set" "main" {
  count = var.use_sftp_letter_supplier_mock ? 1 : 0

  rule_set_name = aws_ses_receipt_rule_set.main.0.rule_set_name
}
