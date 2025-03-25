module "lambda_copy_scanned_object_to_internal" {
  source      = "../lambda-function"
  description = "Copies quarantine files that have passed virus scan check to internal bucket"

  function_name    = "${local.csi}-copy-scanned-object-to-internal"
  filename         = module.build_virus_scan_lambdas.zips["src/copy-scanned-object-to-internal.ts"].path
  source_code_hash = module.build_virus_scan_lambdas.zips["src/copy-scanned-object-to-internal.ts"].base64sha256
  handler          = "copy-scanned-object-to-internal.handler"

  environment_variables = {
    TEMPLATES_INTERNAL_S3_BUCKET_NAME = module.s3bucket_internal.id
  }

  log_retention_in_days = var.log_retention_in_days

  execution_role_policy_document = data.aws_iam_policy_document.copy_scanned_object_to_internal.json
}

data "aws_iam_policy_document" "copy_scanned_object_to_internal" {
  statement {
    sid    = "AllowS3QuarantineList"
    effect = "Allow"

    actions = [
      "s3:ListBucket",
      "s3:ListBucketVersions",
    ]

    resources = [module.s3bucket_quarantine.arn]
  }

  statement {
    sid    = "AllowS3QuarantineGetObject"
    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:GetObjectVersion",
      "s3:GetObjectTagging",
      "s3:GetObjectVersionTagging",
    ]

    resources = ["${module.s3bucket_quarantine.arn}/*"]
  }

  statement {
    sid    = "AllowS3InternalWrite"
    effect = "Allow"

    actions = [
      "s3:PutObject",
      "s3:PutObjectVersion",
      "s3:PutObjectTagging",
      "s3:PutObjectVersionTagging",
    ]

    resources = ["${module.s3bucket_internal.arn}/*"]
  }

  statement {
    sid    = "AllowKMSAccess"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey",
    ]

    resources = [
      var.kms_key_arn
    ]
  }
}
