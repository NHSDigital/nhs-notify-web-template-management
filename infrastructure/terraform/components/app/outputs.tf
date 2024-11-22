output "amplify" {
  value = {
    id          = aws_amplify_app.main.id
    domain_name = local.root_domain_name
  }
}

output "api_base_url" {
  value = module.templates_api.api_base_url
}
