module "eventpub" {
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/eventpub?ref=v2.0.16"

  name = "eventpub"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  group          = var.group

  log_retention_in_days = var.log_retention_in_days
  kms_key_arn           = data.aws_kms_key.sandbox.arn

  enable_event_cache                 = true
  enable_sns_delivery_logging        = false
  event_cache_buffer_interval        = 0
  sns_success_logging_sample_percent = 0

  data_plane_bus_arn    = "unknown"
  control_plane_bus_arn = "unknown"
}
