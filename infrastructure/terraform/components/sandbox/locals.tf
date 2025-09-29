locals {
  root_domain_name         = "${var.environment}.${local.acct.route53_zone_names["template-mgmt"]}" # e.g. [main|dev|abxy0].templates.[dev|nonprod|prod].nhsnotify.national.nhs.uk
  root_domain_id           = local.acct.route53_zone_ids["template-mgmt"]
  root_domain_nameservers  = local.acct.route53_zone_nameservers["template-mgmt"]
  email_domain             = "sandbox.${local.root_domain_name}"

  sandbox_letter_supplier_mock_proof_requested_sender    = "proof-requested-sender-${var.environment}@${local.email_domain}"
  sandbox_letter_supplier_mock_template_submitted_sender = "template-submitted-sender-${var.environment}@${local.email_domain}"
  sandbox_letter_supplier_mock_recipient                 = "supplier-recipient-${var.environment}@${local.email_domain}"
}
