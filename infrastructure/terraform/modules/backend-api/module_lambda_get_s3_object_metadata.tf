module "lambda_enrich_guardduty_scan_result" {
  source      = "../lambda-function"
  description = "Get S3 Object Metadata"

  function_name    = "${local.csi}-enrich-guardduty-scan-result"
  filename         = module.build_virus_scan_lambdas.zips["src/enrich-guardduty-scan-result.ts"].path
  source_code_hash = module.build_virus_scan_lambdas.zips["src/enrich-guardduty-scan-result.ts"].base64sha256
  handler          = "enrich-guardduty-scan-result.handler"

  log_retention_in_days = var.log_retention_in_days

  execution_role_policy_document = data.aws_iam_policy_document.enrich_guardduty_scan_result.json
}

data "aws_iam_policy_document" "enrich_guardduty_scan_result" {

  statement {
    sid    = "AllowS3Read"
    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:GetObjectVersion",
    ]

    resources = ["${module.s3bucket_quarantine.arn}/*"]
  }
}
