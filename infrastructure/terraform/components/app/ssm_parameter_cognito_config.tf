resource "aws_ssm_parameter" "cognito_config" {

  name        = "/${local.csi}/cognito_config"
  description = "Configuration values for Cognito instance"
  type        = "SecureString"
  value       = data.aws_ssm_parameter.sftp_mock_config.value

  lifecycle {
    ignore_changes = [
      value,
    ]
  }
}
