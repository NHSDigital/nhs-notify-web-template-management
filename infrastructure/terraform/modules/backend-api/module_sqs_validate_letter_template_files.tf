module "sqs_validate_letter_template_files" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/sqs?ref=v2.0.1"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  name           = "validate-letter-template-files"
  create_dlq     = true

  visibility_timeout_seconds = 10
  delay_seconds              = 2

  sqs_kms_key_arn = var.kms_key_arn
}
