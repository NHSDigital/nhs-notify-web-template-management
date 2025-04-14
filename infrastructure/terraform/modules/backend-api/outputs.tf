output "api_base_url" {
  value = aws_api_gateway_stage.main.invoke_url
}

output "send_proof_queue_url" {
  value = module.sftp_upload_queue.sqs_queue_url
}

output "sftp_mock_credential_path" {
  value = try(aws_ssm_parameter.sftp_mock_config[0].name, "")
}

output "sftp_environment" {
  value = local.sftp_environment
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
