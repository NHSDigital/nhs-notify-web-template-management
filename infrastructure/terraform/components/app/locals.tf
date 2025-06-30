locals {
  cloudfront_files_domain_name = "files.${local.root_domain_name}"
  root_domain_name             = "${var.environment}.${local.acct.dns_zone["name"]}"
  lambdas_source_code_dir      = "../../../../lambdas"

  mock_letter_supplier_name = "WTMMOCK"

  use_sftp_letter_supplier_mock = lookup(var.letter_suppliers, local.mock_letter_supplier_name, null) != null
}
