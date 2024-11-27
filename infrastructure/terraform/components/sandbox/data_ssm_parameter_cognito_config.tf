data "aws_ssm_parameter" "cognito_config" {
  name = "/nhs-notify-main-app/cognito_config"
}
