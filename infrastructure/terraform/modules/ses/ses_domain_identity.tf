resource "aws_ses_domain_identity" "main" {
  domain = var.root_domain_name
}
