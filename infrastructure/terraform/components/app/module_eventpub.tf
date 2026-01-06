module "eventpub" {
  # TODO CCM-12089 - move to zip release after fix from the ticket
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/eventpub?ref=v2.0.28"

  name = "eventpub"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  group          = var.group

  log_retention_in_days = var.log_retention_in_days
  kms_key_arn           = module.kms.key_arn

  enable_event_cache = var.enable_event_caching

  enable_sns_delivery_logging        = var.event_delivery_logging
  sns_success_logging_sample_percent = var.event_delivery_logging_success_sample_percentage

  data_plane_bus_arn    = var.data_plane_bus_arn
  control_plane_bus_arn = var.control_plane_bus_arn
}
