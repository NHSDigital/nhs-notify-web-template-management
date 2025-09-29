resource "aws_amplify_domain_association" "domain" {
  app_id                 = aws_amplify_app.main.id
  domain_name            = local.root_domain_name
  enable_auto_sub_domain = true

  sub_domain {
    branch_name = var.branch_name
    prefix      = ""
  }

  sub_domain {
    branch_name = var.branch_name
    prefix      = var.url_prefix
  }
}
