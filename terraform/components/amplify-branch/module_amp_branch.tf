module "amp_branch" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/amp_branch?ref=v1.0.0"

  name                        = var.branch_name
  aws_account_id              = var.account_ids["notify-web-template-management"]
  component                   = var.component
  environment                 = var.environment
  project                     = var.project
  region                      = var.region
  group                       = var.group
  amplify_app_id              = data.aws_ssm_parameter.amplify_app_id.value
  branch                      = var.branch_name
  framework                   = "Next.js - SSR"
  stage                       = local.is_production ? "PRODUCTION" : "DEVELOPMENT"
  description                 = "Amplify branch for ${var.branch_name}"
  enable_auto_build           = false
  enable_pull_request_preview = false
  environment_variables = {
    BACKEND_BRANCH = var.backend_branch
  }
}

data "aws_ssm_parameter" "amplify_app_id" {
  name = "/${var.project}/amplify-app/${var.amplify_app_environment}/amplify-app-id"
}

resource "aws_amplify_webhook" "webhook" {
  app_id      = data.aws_ssm_parameter.amplify_app_id.value
  branch_name = module.amp_branch.name
  description = "${var.branch_name} webhook"
}
