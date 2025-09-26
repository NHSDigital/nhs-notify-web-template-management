resource "aws_cognito_user_pool_client" "sandbox" {
  name         = local.csi
  user_pool_id = aws_cognito_user_pool.sandbox.id

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
  ]

  access_token_validity  = 15 # 1 minutes
  id_token_validity      = 15 # 1 minutes
  refresh_token_validity = 1  # 1 hour

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "hours"
  }
}
