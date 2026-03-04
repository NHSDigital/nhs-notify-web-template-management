module "eventpub" {
  source = "https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/3.0.4/terraform-eventpub.zip"

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
  access_logging_bucket              = local.acct.s3_buckets["access_logs"]["id"]

  data_plane_bus_arn    = var.data_plane_bus_arn
  control_plane_bus_arn = var.control_plane_bus_arn

  # CloudWatch Anomaly Detection for publishing
  enable_publishing_anomaly_detection   = var.enable_event_publishing_anomaly_detection
  publishing_anomaly_band_width         = var.event_publishing_anomaly_band_width
  publishing_anomaly_evaluation_periods = var.event_publishing_anomaly_evaluation_periods
  publishing_anomaly_period             = var.event_publishing_anomaly_period
}
