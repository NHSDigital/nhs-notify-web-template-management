module "object_tagging_enrichment_quarantine" {
  source = "../s3-object-tagging-enrichment"

  id = "quarantine"

  aws_account_id = var.aws_account_id
  component      = var.component
  environment    = var.environment
  group          = var.group
  project        = var.project
  region         = var.region

  source_csi = local.csi

  source_bucket = {
    arn  = module.s3bucket_quarantine.arn
    name = module.s3bucket_quarantine.id
  }

  kms_key_arn = var.kms_key_arn

  target_event_bus_arn = data.aws_cloudwatch_event_bus.default.arn

  log_retention_in_days = var.log_retention_in_days

  output_event_source = "templates.${var.environment}.${var.project}"
}
