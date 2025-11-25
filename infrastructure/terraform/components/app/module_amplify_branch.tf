module "amplify_branch" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-amp_branch.zip"

  name              = "main"
  display_name      = var.url_prefix
  aws_account_id    = var.aws_account_id
  component         = var.component
  environment       = var.environment
  project           = var.project
  region            = var.region
  group             = var.group
  description       = "Amplify branch for main"
  amplify_app_id    = aws_amplify_app.main.id
  branch            = var.branch_name
  stage             = "PRODUCTION"
  enable_auto_build = false

  environment_variables = {
    NOTIFY_SUBDOMAIN        = var.environment
    NEXT_PUBLIC_BASE_PATH   = "/templates"
    NEXT_PUBLIC_GATEWAY_URL = local.gateway_url
  }
}
