module "amplify_branch" {
  source         = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/amp_branch?ref=v1.0.0"

  name           = local.normalised_branch_name
  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  group          = var.group
  description    = "Amplify branch for ${local.normalised_branch_name}"
  amplify_app_id = local.templates.amplify["id"]
  branch         = var.branch_name
  display_name   = local.normalised_branch_name

  environment_variables = {
    NOTIFY_SUBDOMAIN      = var.environment
    NEXT_PUBLIC_BASE_PATH = "/templates~${local.normalised_branch_name}"
  }
}
