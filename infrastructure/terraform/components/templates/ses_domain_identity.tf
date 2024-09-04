resource "aws_ses_domain_identity" "main" {
  domain = local.root_domain_name
}
