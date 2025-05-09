locals {
  cloudfront_domain_name = "files.${local.root_domain_name}"
  root_domain_name       = "${var.environment}.${local.acct.dns_zone["name"]}"
}
