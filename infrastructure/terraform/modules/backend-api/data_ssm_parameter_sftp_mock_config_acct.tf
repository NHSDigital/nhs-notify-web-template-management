data "aws_ssm_parameter" "sftp_mock_config_acct" {
  count = local.use_sftp_letter_supplier_mock ? 1 : 0
  name  = "/nhs-notify-${var.parent_acct_environment}-acct/sftp-mock-config"
}
