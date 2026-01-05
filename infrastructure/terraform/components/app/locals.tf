locals {
  cloudfront_files_domain_name = "files.${local.root_domain_name}"
  root_domain_name             = "${var.environment}.${local.acct.dns_zone["name"]}"
  lambdas_source_code_dir      = "../../../../lambdas"
  log_destination_arn          = "arn:aws:logs:${var.region}:${var.observability_account_id}:destination:nhs-main-obs-firehose-logs"
  log_destination_arn_us       = "arn:aws:logs:us-east-1:${var.observability_account_id}:destination:nhs-main-obs-us-east-1-firehose-logs"
}
