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
    "baseUploadDir": "WTM_MOCK/Incoming,
    "baseDownloadDir": "WTM_MOCK/Outgoing"
  }
  */
  value = "placeholder"

  lifecycle {
    ignore_changes = [value]
  }
}
