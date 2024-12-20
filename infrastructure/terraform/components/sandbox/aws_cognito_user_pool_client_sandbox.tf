resource "aws_cognito_user_pool_client" "sandbox" {
  name         = local.csi
  user_pool_id = aws_cognito_user_pool.sandbox.id

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]
}
