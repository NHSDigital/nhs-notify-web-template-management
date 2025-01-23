locals {
  root_domain_name = "${var.environment}.${local.acct.dns_zone["name"]}"
  ses_domain_name  = var.override_ses_domain_name == "NA" ? local.root_domain_name : var.override_ses_domain_name
}
