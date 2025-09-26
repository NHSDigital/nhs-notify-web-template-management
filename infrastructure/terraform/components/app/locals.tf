locals {
  cloudfront_files_domain_name = "files.${local.root_domain_name}"

  lambdas_source_code_dir      = "../../../../lambdas"
  log_destination_arn          = "arn:aws:logs:${var.region}:${var.observability_account_id}:destination:nhs-main-obs-firehose-logs"

  root_domain_name         = "${var.environment}.${local.acct.route53_zone_names["template-mgmt"]}" # e.g. [main|dev|abxy0].templates.[dev|nonprod|prod].nhsnotify.national.nhs.uk
  root_domain_id           = local.acct.route53_zone_ids["template-mgmt"]
  root_domain_nameservers  = local.acct.route53_zone_nameservers["template-mgmt"]
}
