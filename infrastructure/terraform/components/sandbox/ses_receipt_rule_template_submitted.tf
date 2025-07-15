resource "aws_ses_receipt_rule" "template_submitted" {
  name          = "${local.csi}-store-email-template-submitted"
  rule_set_name = local.acct["ses_testing_config"].rule_set_name

  # Despite being called "recipients", AWS appears to apply this check to the sender email
  recipients    = [local.sandbox_letter_supplier_mock_template_submitted_sender]
  enabled       = true
  scan_enabled  = true
  tls_policy    = "Optional"

  s3_action {
    position          = 1
    bucket_name       = local.acct["ses_testing_config"].bucket_name
    object_key_prefix = "template-submitted-emails-${var.environment}/"
    iam_role_arn      = local.acct["ses_testing_config"].iam_role_arn
  }
}
