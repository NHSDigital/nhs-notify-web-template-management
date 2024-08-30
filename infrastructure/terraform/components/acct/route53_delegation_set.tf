resource "aws_route53_delegation_set" "main" {
  reference_name = "templates.${var.root_domain_name}"
}
