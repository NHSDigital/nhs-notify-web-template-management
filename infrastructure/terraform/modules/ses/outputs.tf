output "domain" {
  value = var.external_email_domain == null ? aws_ses_domain_identity.main.domain : aws_ses_domain_identity.external.0.domain
}
