resource "aws_ses_domain_identity" "overload" {
  count = var.ses_overload_domain == null ? 0 : 1

  domain = var.ses_overload_domain
}
