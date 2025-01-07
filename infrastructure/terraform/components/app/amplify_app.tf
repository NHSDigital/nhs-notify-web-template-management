resource "aws_amplify_app" "main" {
  name         = local.csi
  repository   = "https://github.com/NHSDigital/nhs-notify-web-template-management"
  access_token = data.aws_ssm_parameter.github_pat_ssm_param_name.value

  iam_service_role_arn = aws_iam_role.amplify.arn

  enable_auto_branch_creation = false
  enable_branch_auto_build    = var.enable_amplify_branch_auto_build
  platform                    = "WEB_COMPUTE"

  enable_basic_auth      = var.enable_amplify_basic_auth ? true : false
  basic_auth_credentials = var.enable_amplify_basic_auth ? base64encode("${local.csi}:${aws_ssm_parameter.amplify_password[0].value}") : null

  dynamic "auto_branch_creation_config" {
    for_each = var.enable_amplify_basic_auth ? [1] : []

    content {
      basic_auth_credentials = base64encode("${local.csi}:${aws_ssm_parameter.amplify_password[0].value}")
      enable_basic_auth      = true
    }
  }

  auto_branch_creation_patterns = [
    "*",
    "*/**"
  ]

  environment_variables = {
    NOTIFY_GROUP                = var.group
    NOTIFY_ENVIRONMENT          = var.environment
    NOTIFY_DOMAIN_NAME          = local.root_domain_name
    ACCOUNT_ID                  = var.aws_account_id
    NEXT_PUBLIC_DISABLE_CONTENT = var.disable_content
    AMPLIFY_MONOREPO_APP_ROOT   = "frontend"
    BACKEND_API_URL             = module.backend_api.api_base_url
    USER_POOL_ID                = jsondecode(data.aws_ssm_parameter.cognito_config.value)["USER_POOL_ID"]
    USER_POOL_CLIENT_ID         = jsondecode(data.aws_ssm_parameter.cognito_config.value)["USER_POOL_CLIENT_ID"]
  }
}
