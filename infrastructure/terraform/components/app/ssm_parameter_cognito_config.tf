resource "aws_ssm_parameter" "cognito_config" {
  name  = "/${local.csi}/cognito_config"
  type  = "String"

  value = jsonencode({
    "USER_POOL_ID":"unset",
    "USER_POOL_CLIENT_ID":"unset"
  })

  lifecycle {
    ignore_changes = [value]
  }
}
