resource "aws_iam_role" "ses_receipts" {
  count = var.use_sftp_letter_supplier_mock ? 1 : 0
  name  = "${local.csi}-ses-receipts"

  assume_role_policy = data.aws_iam_policy_document.ses_assumerole.0.json
}

data "aws_iam_policy_document" "ses_assumerole" {
  count = var.use_sftp_letter_supplier_mock ? 1 : 0
  statement {
    sid    = "SESAssumeRole"
    effect = "Allow"

    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type = "Service"

      identifiers = [
        "ses.amazonaws.com"
      ]
    }
  }
}

resource "aws_iam_role_policy" "ses_receipts" {
  count = var.use_sftp_letter_supplier_mock ? 1 : 0
  name  = "${local.csi}-ses-receipts"
  role  = aws_iam_role.ses_receipts.0.id

  policy = data.aws_iam_policy_document.ses_receipts.0.json
}

data "aws_iam_policy_document" "ses_receipts" {
  count = var.use_sftp_letter_supplier_mock ? 1 : 0
  statement {
    sid    = "AllowKMSAccess"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:DescribeKey",
      "kms:Encrypt",
      "kms:GenerateDataKey*",
      "kms:ReEncrypt*",
    ]

    resources = [
      var.kms_key_arn
    ]
  }

  statement {
    sid    = "AllowS3Access"
    effect = "Allow"

    actions = [
      "s3:PutObject",
    ]

    resources = [
      "${module.s3bucket_ses.0.arn}/*",
    ]
  }
}
