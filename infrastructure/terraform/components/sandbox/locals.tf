locals {
  mock_letter_supplier_name = "WTMMOCK"

  use_sftp_letter_supplier_mock = lookup(var.letter_suppliers, local.mock_letter_supplier_name, null) != null

  email_domain                           = "sandbox.${local.acct.dns_zone["name"]}"
  sandbox_letter_supplier_mock_sender    = "template-submitted-sender-${var.environment}@${local.email_domain}"
  sandbox_letter_supplier_mock_recipient = "template-submitted-recipient-${var.environment}@${local.email_domain}"

  # var.letter_suppliers is defined at a point where we don't know what the environment is, so
  # we need to add the environment-dependent test recipient separately here
  letter_suppliers = local.use_sftp_letter_supplier_mock ? merge(
    var.letter_suppliers,
    { WTMMOCK = {
      email_addresses  = concat(var.letter_suppliers.WTMMOCK.email_addresses, [local.sandbox_letter_supplier_mock_recipient])
      enable_polling   = true
      default_supplier = true
    } }
  ) : var.letter_suppliers
}
