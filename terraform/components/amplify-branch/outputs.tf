output "app_id" {
  value     = data.aws_ssm_parameter.amplify_app_id.value
  sensitive = true
}

output "webhook_url" {
  value     = aws_amplify_webhook.webhook.url
  sensitive = true
}

output "app_url" {
  value     = "https://${aws_amplify_branch.branch.display_name}.${data.aws_ssm_parameter.amplify_app_id.value}.amplifyapp.com"
  sensitive = true
}

output "app_basic_auth" {
  value     = base64encode("${data.aws_ssm_parameter.amplify_app_username.value}:${data.aws_ssm_parameter.amplify_app_password.value}")
  sensitive = true
}
