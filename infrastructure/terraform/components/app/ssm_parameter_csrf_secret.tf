resource "aws_ssm_parameter" "csrf_secret" {
  name        = "/${local.csi}/csrf_secret"
  description = "The Basic Auth password used for the amplify app. This parameter is sourced from Github Environment variables"

  type  = "SecureString"
  value = var.CSRF_SECRET
}
