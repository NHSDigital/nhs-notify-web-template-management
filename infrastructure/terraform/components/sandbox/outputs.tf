output "api_base_url" {
  value = module.backend_api.api_base_url
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.sandbox.id
}

output "cognito_user_pool_client_id" {
  value = aws_cognito_user_pool_client.sandbox.id
}

output "templates_table_name" {
  value = module.backend_api.templates_table_name
}

output "internal_bucket_name" {
  value = module.backend_api.internal_bucket_name
}

output "quarantine_bucket_name" {
  value = module.backend_api.quarantine_bucket_name
}
