locals {
  mock_letter_supplier_name = "WTMMOCK"

  use_sftp_letter_supplier_mock = lookup(var.letter_suppliers, local.mock_letter_supplier_name, null) != null

  sandbox_letter_supplier_mock_recipient = "template-submitted-recipient-${var.environment}@sandbox.${local.acct.dns_zone["name"]}"

  letter_suppliers = local.use_sftp_letter_supplier_mock ? merge(
        var.letter_suppliers,
        { WTMMOCK = {
            email_addresses  = concat(var.letter_suppliers.WTMMOCK.email_addresses, [local.sandbox_letter_supplier_mock_recipient])
            enable_polling   = true
            default_supplier = true
        }}
    ) : var.letter_suppliers
}
