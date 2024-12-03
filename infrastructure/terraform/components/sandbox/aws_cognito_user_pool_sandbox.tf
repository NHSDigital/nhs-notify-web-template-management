resource "aws_cognito_user_pool" "sandbox" {
  name = local.csi
}
