resource "aws_route53_zone" "main" {
  name = "templates.${var.root_domain_name}"

  delegation_set_id = aws_route53_delegation_set.main.id
}
