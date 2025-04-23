resource "aws_ssm_parameter" "sftp_mock_config" {
  count = local.use_sftp_letter_supplier_mock ? 1 : 0

  name = format(
    "/%s/sftp-mock-config",
    local.csi,
  )
  description = "Configuration values for accessing an SFTP mock server"
  type        = "SecureString"

  /*
  JSON object matching:
  {
    "host": string
    "username": string,
    "privateKey": string,
    "baseUploadDir": "WTMMOCK/Incoming,
    "baseDownloadDir": "WTMMOCK/Outgoing"
  }
  */
  value = "placeholder"

  lifecycle {
    ignore_changes = [value]
  }
}
