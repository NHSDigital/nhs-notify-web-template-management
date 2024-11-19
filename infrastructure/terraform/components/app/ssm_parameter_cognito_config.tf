resource "aws_ssm_parameter" "cognito_config" {

  name        = "/${local.csi}/cognito_config"
  description = "Configuration values for Cognito instance"
  type        = "SecureString"
  value       = jsonencode({
    user_pool_id = "placeholder"
    user_pool_client_id = "placeholder"
  })

  lifecycle {
    ignore_changes = [
      value,
    ]
  }
}
