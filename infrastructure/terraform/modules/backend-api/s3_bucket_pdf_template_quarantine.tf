#tfsec:ignore:aws-s3-enable-bucket-logging
resource "aws_s3_bucket" "pdf_template_quarantine" {
  bucket        = "${local.csi_global}-quarantine"
  force_destroy = true
}

resource "aws_s3_bucket_policy" "pdf_template_quarantine" {
  bucket = aws_s3_bucket.pdf_template_quarantine.id
  policy = data.aws_iam_policy_document.pdf_template_quarantine_bucket_policy.json
}

data "aws_iam_policy_document" "pdf_template_quarantine_bucket_policy" {
  statement {
    effect  = "Deny"
    actions = ["s3:*"]
    resources = [
      aws_s3_bucket.pdf_template_quarantine.arn,
      "${aws_s3_bucket.pdf_template_quarantine.arn}/*",
    ]
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values = [
        false
      ]
    }
  }
}

resource "aws_s3_bucket_public_access_block" "pdf_template_quarantine" {
  depends_on = [
    aws_s3_bucket.pdf_template_quarantine,
    aws_s3_bucket_policy.pdf_template_quarantine
  ]
  bucket = aws_s3_bucket.pdf_template_quarantine.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "pdf_template_quarantine" {
  bucket = aws_s3_bucket.pdf_template_quarantine.bucket

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.s3.arn
    }
  }
}

resource "aws_s3_bucket_ownership_controls" "pdf_template_quarantine" {
  bucket = aws_s3_bucket.pdf_template_quarantine.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_versioning" "pdf_template_quarantine" {
  bucket = aws_s3_bucket.pdf_template_quarantine.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_notification" "pdf_template_quarantine" {
  bucket      = aws_s3_bucket.pdf_template_quarantine.id
  eventbridge = true
}
