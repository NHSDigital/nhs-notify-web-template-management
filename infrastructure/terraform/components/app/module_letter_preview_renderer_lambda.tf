module "letter_preview_renderer_lambda" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.32/terraform-lambda.zip"

  project        = var.project
  environment    = var.environment
  component      = var.component
  aws_account_id = var.aws_account_id
  region         = var.region
  group          = var.group

  function_name = "letter-preview-renderer"
  description   = "Letter preview renderer Lambda"

  kms_key_arn = module.kms.key_arn

  package_type           = "Image"
  image_uri              = "${var.aws_account_id}.dkr.ecr.${var.region}.amazonaws.com/${var.container_lambda_ecr_repo}:${var.project}-${var.environment}-${var.component}-letter-preview-renderer-${var.image_tag_suffix}"
  image_repository_names = [var.container_lambda_ecr_repo]

  memory  = 128
  timeout = 3

  log_retention_in_days = var.log_retention_in_days

  log_destination_arn       = local.log_destination_arn
  log_subscription_role_arn = local.acct.log_subscription_role_arn
}
