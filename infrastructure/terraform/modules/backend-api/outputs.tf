output "api_base_url" {
  value = aws_api_gateway_stage.main.invoke_url
}

output "dynamodb_table_templates" {
  value = aws_dynamodb_table.templates.name
}
