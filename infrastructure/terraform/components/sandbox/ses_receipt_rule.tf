resource "aws_ses_receipt_rule" "proof_requested" {
  name          = "${local.csi}-store-email-proof-requested"
  rule_set_name = local.acct["ses_testing_config"].rule_set_name

  recipients   = [local.sandbox_letter_supplier_mock_recipient]
  enabled      = true
  scan_enabled = true
  tls_policy   = "Optional"

  s3_action {
    position          = 1
    bucket_name       = local.acct["ses_testing_config"].bucket_name
    object_key_prefix = "emails-${var.environment}/"
    iam_role_arn      = local.acct["ses_testing_config"].iam_role_arn
  }
}
