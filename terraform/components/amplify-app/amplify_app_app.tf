resource "aws_amplify_app" "app" {
  name                   = local.csi
  repository             = var.repository
  access_token           = var.access_token
  enable_basic_auth      = true
  platform               = "WEB_COMPUTE"
  basic_auth_credentials = base64encode("${aws_ssm_parameter.amplify_repository_username.value}:${aws_ssm_parameter.amplify_repository_password.value}")
  description            = "Template management amplify app for ${var.environment}"

  enable_auto_branch_creation = false

  enable_branch_auto_deletion = true

  enable_branch_auto_build = false

  build_spec = file("./amplify.yaml")
}

# Terraform does not currently support data resources for Amplify so we use SSM to make the app ID available to the other component
resource "aws_ssm_parameter" "amplify_app_id" {
  name  = "/${var.project}/${var.component}/${var.environment}/amplify-app-id"
  type  = "String"
  value = aws_amplify_app.app.id

  description = "Amplify App ID"
}
