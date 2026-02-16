module "backend_api" {
  source = "../../modules/backend-api"

  project                 = var.project
  environment             = var.environment
  component               = var.component
  aws_account_id          = var.aws_account_id
  region                  = var.region
  group                   = var.group
  csi                     = local.csi
  log_retention_in_days   = var.log_retention_in_days
  parent_acct_environment = var.parent_acct_environment
  function_s3_bucket      = local.acct.s3_buckets["artefacts"]["id"]

  cognito_config = {
    USER_POOL_ID        = aws_cognito_user_pool.sandbox.id
    USER_POOL_CLIENT_ID = aws_cognito_user_pool_client.sandbox.id
  }

  letter_suppliers = {
    WTMMOCK = {
      email_addresses  = [local.sandbox_letter_supplier_mock_recipient]
      enable_polling   = true
      default_supplier = true
    }
  }

  kms_key_arn = data.aws_kms_key.sandbox.arn

  sns_topic_arn = module.eventpub.sns_topic.arn

  send_to_firehose = false

  email_domain                            = local.email_domain
  template_submitted_sender_email_address = local.sandbox_letter_supplier_mock_template_submitted_sender
  proof_requested_sender_email_address    = local.sandbox_letter_supplier_mock_proof_requested_sender

  image_tag_suffix = var.image_tag_suffix
}
