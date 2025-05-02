resource "aws_ssm_parameter" "sftp_config" {
  for_each = { for k, v in var.letter_suppliers : k => v if k != local.mock_letter_supplier_name }

  name        = "/${local.csi}/sftp-config/${each.key}"
  description = "Configuration values for accessing an SFTP server"
  type        = "SecureString"
  value       = "placeholder"

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "sftp_mock_config" {
  count = local.use_sftp_letter_supplier_mock ? 1 : 0

  name        = "/${local.csi}/sftp-config/${local.mock_letter_supplier_name}"
  description = "Configuration values for accessing the mock SFTP server"
  type        = "SecureString"
  value       = data.aws_ssm_parameter.sftp_mock_config_acct[0].value
}
