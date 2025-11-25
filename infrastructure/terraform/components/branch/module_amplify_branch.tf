module "amplify_branch" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-amp_branch.zip"

  name         = local.normalised_branch_name
  display_name = local.normalised_branch_name
  description  = "Amplify branch for ${local.normalised_branch_name}"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  group          = var.group

  amplify_app_id = local.app.amplify["id"]
  branch         = var.branch_name

  enable_auto_build = true

  environment_variables = {
    NOTIFY_SUBDOMAIN        = var.environment
    NEXT_PUBLIC_BASE_PATH   = "/templates~${local.normalised_branch_name}"
    NEXT_PUBLIC_GATEWAY_URL = local.app.amplify["gateway_url"]
  }
}
