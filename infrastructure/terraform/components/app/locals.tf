locals {
  cloudfront_files_domain_name = "files.${local.root_domain_name}"
  root_domain_name             = "${var.environment}.${local.acct.dns_zone["name"]}"

  lambdas_dir             = "../../../../lambdas"
  lambdas_source_code_dir = abspath("${path.module}/${local.lambdas_dir}")
}
