module "lambda_copy_scanned_object_to_internal" {
  source      = "../lambda-function"
  description = "Copies quarantine files that have passed virus scan check to internal bucket"

  dead_letter_target_arn         = module.sqs_virus_scan_passed_copy_object_dlq.sqs_queue_arn
  execution_role_policy_document = data.aws_iam_policy_document.copy_scanned_object_to_internal.json
  filename                       = module.build_template_lambda.zips[local.backend_lambda_entrypoints.copy_scanned_object_to_internal].path
  function_name                  = "${local.csi}-copy-scanned-file"
  handler                        = "copy-scanned-object-to-internal.handler"
  log_retention_in_days          = var.log_retention_in_days
  source_code_hash               = module.build_template_lambda.zips[local.backend_lambda_entrypoints.copy_scanned_object_to_internal].base64sha256

  environment_variables = local.backend_lambda_environment_variables
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

  statement {
    sid    = "AllowSQSDLQ"
    effect = "Allow"

    actions = [
      "sqs:SendMessage",
    ]

    resources = [
      module.sqs_virus_scan_passed_copy_object_dlq.sqs_queue_arn,
    ]
  }
}
