output "iam_role_arn" {
  value = aws_iam_role.ses_receipts.arn
}

output "bucket_name" {
  value = module.s3bucket_ses.id
}

output "rule_set_name" {
  value = aws_ses_receipt_rule_set.main.rule_set_name
}
