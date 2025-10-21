module "eventpub" {
  # TODO CCM-12089 - move to zip release after fix from the ticket
  source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/eventpub?ref=v2.0.19"

  name = "eventpub"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  project        = var.project
  region         = var.region
  group          = var.group

  log_retention_in_days = var.log_retention_in_days
  kms_key_arn           = data.aws_kms_key.sandbox.arn

  enable_event_cache                   = true
  enable_sns_delivery_logging          = false
  enable_firehose_raw_message_delivery = true
  event_cache_buffer_interval          = 0
  sns_success_logging_sample_percent   = 0
  force_destroy                        = true

  # In the context of sbx these planes are not needed but the module require them
  data_plane_bus_arn    = aws_sns_topic.events.arn
  control_plane_bus_arn = aws_sns_topic.events.arn
}
