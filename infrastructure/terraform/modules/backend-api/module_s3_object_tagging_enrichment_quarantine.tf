module "object_tagging_enrichment_quarantine" {
  source = "../s3-object-tagging-enrichment"
  csi    = local.csi
  id     = "quarantine"

  source_bucket = {
    name = aws_s3_bucket.pdf_template_scan.id
  }

  kms_key_arn = var.kms_key_arn
}
