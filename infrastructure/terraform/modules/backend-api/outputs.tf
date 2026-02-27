output "api_base_url" {
  value = aws_api_gateway_stage.main.invoke_url
}

output "client_ssm_path_prefix" {
  value = local.client_ssm_path_prefix
}

output "download_bucket_name" {
  value = module.s3bucket_download.id
}

output "download_bucket_regional_domain_name" {
  value = module.s3bucket_download.bucket_regional_domain_name
}

output "internal_bucket_name" {
  value = module.s3bucket_internal.id
}

output "request_proof_queue_url" {
  value = module.sqs_sftp_upload.sqs_queue_url
}

output "sftp_mock_credential_path" {
  value = try(aws_ssm_parameter.sftp_mock_config[0].name, "")
}

output "sftp_poll_lambda_name" {
  value = module.lambda_sftp_poll.function_name
}

output "sftp_environment" {
  value = local.sftp_environment
}

output "templates_table_name" {
  value = aws_dynamodb_table.templates.name
}

output "quarantine_bucket_name" {
  value = module.s3bucket_quarantine.id
}

output "routing_config_table_name" {
  value = aws_dynamodb_table.routing_configuration.name
}

output "letter_variants_table_name" {
  value = aws_dynamodb_table.letter_variants.name
}
