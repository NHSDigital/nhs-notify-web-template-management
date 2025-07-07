resource "aws_ses_receipt_rule_set" "main" {
  rule_set_name = local.csi
}

resource "aws_ses_active_receipt_rule_set" "main" {
  rule_set_name = aws_ses_receipt_rule_set.main.rule_set_name
}
