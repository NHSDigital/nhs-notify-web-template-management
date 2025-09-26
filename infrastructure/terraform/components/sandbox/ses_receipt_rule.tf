resource "aws_ses_receipt_rule" "proof_requested" {
  name          = "${local.csi}-store-email-proof-requested"
  rule_set_name = aws_ses_receipt_rule_set.main.rule_set_name

  recipients   = [local.sandbox_letter_supplier_mock_recipient]
  enabled      = true
  scan_enabled = true
  tls_policy   = "Optional"

  s3_action {
    position          = 1
    bucket_name       = local.acct.additional_s3_buckets["template-mgmt_ses-test-config"]["name"]
    object_key_prefix = "emails-${var.environment}/"
    iam_role_arn      = aws_iam_role.ses_receipts.arn
  }
}
