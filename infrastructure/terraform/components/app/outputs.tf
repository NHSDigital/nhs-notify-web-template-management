output "amplify" {
  value = {
    id          = aws_amplify_app.main.id
    domain_name = local.root_domain_name
    branch_name = var.branch_name
  }
}

output "deployment" {
  description = "Deployment details used for post-deployment scripts"
  value = {
    aws_region     = var.region
    aws_account_id = var.aws_account_id
    project        = var.project
    environment    = var.environment
    group          = var.group
    component      = local.component
    commit_id      = var.commit_id
  }
}
