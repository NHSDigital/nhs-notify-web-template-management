module "lambda_delete_failed_scanned_object" {
  source      = "../lambda-function"
  description = "Deletes quarantine files that have failed virus scan check"

  dead_letter_target_arn         = module.sqs_virus_scan_failed_delete_object_dlq.sqs_queue_arn
  execution_role_policy_document = data.aws_iam_policy_document.delete_failed_scanned_object.json
  filename                       = module.build_template_lambda.zips[local.backend_lambda_entrypoints.delete_failed_scanned_object].path
  function_name                  = "${local.csi}-delete-failed-scanned-object"
  handler                        = "delete-failed-scanned-object.handler"
  log_retention_in_days          = var.log_retention_in_days
  source_code_hash               = module.build_template_lambda.zips[local.backend_lambda_entrypoints.delete_failed_scanned_object].base64sha256
  environment_variables          = local.backend_lambda_environment_variables
  destination_arn                = var.destination_arn
  subscription_role_arn          = var.subscription_role_arn
}

data "aws_iam_policy_document" "delete_failed_scanned_object" {
  statement {
    sid    = "AllowS3QuarantineDelete"
    effect = "Allow"

    actions = [
      "s3:DeleteObject",
      "s3:DeleteObjectVersion",
    ]

    resources = ["${module.s3bucket_quarantine.arn}/*"]
  }

  statement {
    sid    = "AllowSQSDLQ"
    effect = "Allow"

    actions = [
      "sqs:SendMessage",
    ]

    resources = [
      module.sqs_virus_scan_failed_delete_object_dlq.sqs_queue_arn,
    ]
  }

  statement {
    sid    = "AllowKMSAccessSQSDLQ"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey",
    ]

    resources = [
      var.kms_key_arn,
    ]
  }
}
