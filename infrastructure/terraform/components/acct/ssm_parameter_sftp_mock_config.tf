resource "aws_ssm_parameter" "sftp_mock_config" {
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
