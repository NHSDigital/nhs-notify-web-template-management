output "app_id" {
  value     = data.aws_ssm_parameter.amplify_app_id.value
  sensitive = true
}

output "webhook_url" {
  value     = aws_amplify_webhook.webhook.url
  sensitive = true
}
