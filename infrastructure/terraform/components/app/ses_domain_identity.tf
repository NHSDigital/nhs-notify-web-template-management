resource "aws_ses_domain_identity" "main" {
  domain = var.ses_domain_name
}
