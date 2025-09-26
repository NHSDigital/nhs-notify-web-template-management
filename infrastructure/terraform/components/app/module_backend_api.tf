# TODO: CCM-8418
# tfsec:ignore:aws-iam-no-policy-wildcards
module "backend_api" {
  source = "../../modules/backend-api"

  project                 = var.project
  environment             = var.environment
  component               = local.component
  aws_account_id          = var.aws_account_id
  region                  = var.region
  group                   = var.group

  log_retention_in_days     = var.log_retention_in_days
  kms_key_arn               = module.kms.key_arn
  function_s3_bucket        = local.acct.s3_buckets["lambda_function_artefacts"]["id"]
  vpc_id                    = local.acct.vpc_ids["template-mgmt"]
  log_destination_arn       = local.log_destination_arn
  log_subscription_role_arn = local.acct.log_subscription_role_arn

  cloudfront_distribution_arn = aws_cloudfront_distribution.main.arn

  cognito_config = jsondecode(aws_ssm_parameter.cognito_config.value)

  enable_backup = var.destination_vault_arn != null ? true : false

  letter_suppliers = var.letter_suppliers
  send_to_firehose = true

  email_domain                            = module.ses.domain
  template_submitted_sender_email_address = "template-submitted@${module.ses.domain}"
  proof_requested_sender_email_address    = "proof-requested@${module.ses.domain}"
  ssm_parameter_sftp_mock_config_name     = local.acct.additional_ssm_parameters["template-mgmt_sftp-mock-config"]["name"]

  sns_topic_arn = module.eventpub.sns_topic.arn
}
