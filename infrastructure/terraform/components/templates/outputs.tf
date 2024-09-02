output "amplify" {
  value = {
    id          = aws_amplify_app.main.id
    domain_name = local.root_domain_name
  }
}
