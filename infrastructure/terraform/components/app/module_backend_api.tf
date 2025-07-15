# TODO: CCM-8418
# tfsec:ignore:aws-iam-no-policy-wildcards
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
  kms_key_arn             = module.kms.key_arn
  parent_acct_environment = var.parent_acct_environment
  function_s3_bucket      = local.acct.s3_buckets["artefacts"]["id"]

  cloudfront_distribution_arn = aws_cloudfront_distribution.main.arn

  cognito_config = jsondecode(aws_ssm_parameter.cognito_config.value)

  enable_backup = var.destination_vault_arn != null ? true : false

  enable_proofing           = var.enable_proofing
  letter_suppliers          = var.letter_suppliers
  log_destination_arn       = local.log_destination_arn
  log_subscription_role_arn = local.acct.log_subscription_role_arn

  send_to_firehose = true

  email_domain                            = module.ses.domain
  template_submitted_sender_email_address = "template-submitted@${module.ses.domain}"
  proof_requested_sender_email_address    = "proof-requested@${module.ses.domain}"
}
