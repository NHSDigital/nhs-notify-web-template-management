output "api_base_url" {
  value = module.backend_api.api_base_url
}

output "client_ssm_path_prefix" {
  value = module.backend_api.client_ssm_path_prefix
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.sandbox.id
}

output "cognito_user_pool_client_id" {
  value = aws_cognito_user_pool_client.sandbox.id
}

output "download_bucket_name" {
  value = module.backend_api.download_bucket_name
}

output "internal_bucket_name" {
  value = module.backend_api.internal_bucket_name
}

output "send_proof_queue_url" {
  value = module.backend_api.send_proof_queue_url
}

output "sftp_mock_credential_path" {
  value = module.backend_api.sftp_mock_credential_path
}

output "sftp_environment" {
  value = module.backend_api.sftp_environment
}

output "sftp_poll_lambda_name" {
  value = module.backend_api.sftp_poll_lambda_name
}

output "templates_table_name" {
  value = module.backend_api.templates_table_name
}

output "quarantine_bucket_name" {
  value = module.backend_api.quarantine_bucket_name
}

output "deployment" {
  description = "Deployment details used for post-deployment scripts"
  value = {
    aws_region     = var.region
    aws_account_id = var.aws_account_id
    project        = var.project
    environment    = var.environment
    group          = var.group
    component      = var.component
  }
}
