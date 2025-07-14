locals {
  cloudfront_files_domain_name = "files.${local.root_domain_name}"
  root_domain_name             = "${var.environment}.${local.acct.dns_zone["name"]}"
  lambdas_source_code_dir      = "../../../../lambdas"
  log_destination_arn          = var.group == "nhs-notify-template-management-prod" ? "arn:aws:logs:${var.region}:${var.observability_account_id}:destination:nhs-notify-main-acct-firehose-logs" : "arn:aws:logs:${var.region}:${var.observability_account_id}:destination:nhs-main-obs-firehose-logs" #Please remove this after we do dev/nonprod cutover for this BC
}
