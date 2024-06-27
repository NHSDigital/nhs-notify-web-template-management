resource "aws_amplify_branch" "branch" {
  app_id      = data.aws_ssm_parameter.amplify_app_id.value
  branch_name = var.branch_name
  framework   = "Next.js - SSR"
  stage       = local.is_production ? "PRODUCTION" : "DEVELOPMENT"

  description = "Amplify branch for ${var.branch_name}"

  enable_auto_build = false
}

data "aws_ssm_parameter" "amplify_app_id" {
  name = "/${var.project}/amplify-app/${var.environment}/amplify-app-id"
}

resource "aws_amplify_domain_association" "domain_association" {
  app_id                = data.aws_ssm_parameter.amplify_app_id.value
  domain_name           = "notify.nhs.co.uk"
  wait_for_verification = false

  sub_domain {
    branch_name = aws_amplify_branch.branch.branch_name
    prefix      = var.environment
  }
}

resource "aws_amplify_webhook" "webhook" {
  app_id      = data.aws_ssm_parameter.amplify_app_id.value
  branch_name = aws_amplify_branch.branch.branch_name
  description = "${var.branch_name} webhook"
}
