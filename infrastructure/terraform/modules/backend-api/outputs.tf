output "api_base_url" {
  value = aws_api_gateway_stage.main.invoke_url
}

output "templates_table_name" {
  value = aws_dynamodb_table.templates.name
}

output "internal_bucket_name" {
  value = module.s3bucket_internal.id
}

output "quarantine_bucket_name" {
  value = module.s3bucket_quarantine.id
}
