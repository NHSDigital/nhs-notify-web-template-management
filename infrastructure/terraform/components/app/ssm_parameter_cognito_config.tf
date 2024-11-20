data "aws_ssm_parameter" "cognito_config" {
  name        = "/${local.csi}/cognito_config"
}
