locals {
  email_domain                                           = "sandbox.${local.acct.dns_zone["name"]}"
  sandbox_letter_supplier_mock_proof_requested_sender    = "proof-requested-sender-${var.environment}@${local.email_domain}"
  sandbox_letter_supplier_mock_template_submitted_sender = "template-submitted-sender-${var.environment}@${local.email_domain}"
  sandbox_letter_supplier_mock_recipient                 = "supplier-recipient-${var.environment}@${local.email_domain}"
}
