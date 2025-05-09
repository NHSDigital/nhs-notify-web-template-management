locals {
  cloudfront_files_domain_name = "files.${local.root_domain_name}"
  root_domain_name             = "${var.environment}.${local.acct.dns_zone["name"]}"

  repo_root               = abspath("${path.module}/../../../..")
  lambdas_source_code_dir = abspath("${local.repo_root}/lambdas")
}
