module "backend_api" {
  source = "../../modules/backend-api"

  project        = var.project
  environment    = var.environment
  component      = local.component
  aws_account_id = var.aws_account_id
  region         = var.region
  group          = var.group

  log_retention_in_days   = var.log_retention_in_days
  kms_key_arn             = module.kms.key_arn
  function_s3_bucket      = local.acct.s3_buckets["lambda_function_artefacts"]["id"]
  vpc_id                  = local.acct.vpc_ids["template-mgmt"]

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

  send_to_firehose    = false
  enable_event_stream = true

  email_domain                            = local.email_domain
  template_submitted_sender_email_address = local.sandbox_letter_supplier_mock_template_submitted_sender
  proof_requested_sender_email_address    = local.sandbox_letter_supplier_mock_proof_requested_sender
  sns_topic_arn                           = module.eventpub.sns_topic.arn
  ssm_parameter_sftp_mock_config_name     = local.acct.additional_ssm_parameters["template-mgmt_sftp-mock-config"]["name"]
}
