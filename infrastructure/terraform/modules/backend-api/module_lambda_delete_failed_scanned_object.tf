module "lambda_delete_failed_scanned_object" {
  source      = "../lambda-function"
  description = "Deletes quarantine files that have failed virus scan check"

  function_name    = "${local.csi}-delete-failed-scanned-object"
  filename         = module.build_virus_scan_lambdas.zips["src/delete-failed-scanned-object.ts"].path
  source_code_hash = module.build_virus_scan_lambdas.zips["src/delete-failed-scanned-object.ts"].base64sha256
  handler          = "delete-failed-scanned-object.handler"

  log_retention_in_days = var.log_retention_in_days

  execution_role_policy_document = data.aws_iam_policy_document.delete_failed_scanned_object.json
}

data "aws_iam_policy_document" "delete_failed_scanned_object" {
  statement {
    sid    = "AllowS3QuarantineDelete"
    effect = "Allow"

    actions = [
      "s3:DeleteObject"
    ]

    resources = ["${module.s3bucket_quarantine.arn}/*"]
  }
}
