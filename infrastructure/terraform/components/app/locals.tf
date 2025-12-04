locals {
  cloudfront_files_domain_name = "files.${local.root_domain_name}"
  root_domain_name             = "${var.environment}.${local.acct.dns_zone["name"]}"
  lambdas_source_code_dir      = "../../../../lambdas"
  log_destination_arn          = "arn:aws:logs:${var.region}:${var.observability_account_id}:destination:nhs-main-obs-firehose-logs"
  gateway_url = var.gateway_domain != null ? (
    var.use_environment_specific_gateway_domain
    ? "https://${var.environment}.${var.gateway_domain}"
    : "https://${var.gateway_domain}"
  ) : "https://${aws_amplify_app.main.default_domain}"
}
