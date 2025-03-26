module "lambda_get_s3_object_tags" {
  source      = "../lambda-function"
  description = "Get S3 Object Tags"

  function_name    = "${local.csi}-get-s3-object-tags"
  filename         = module.build_virus_scan_lambdas.zips["src/get-s3-object-tags.ts"].path
  source_code_hash = module.build_virus_scan_lambdas.zips["src/get-s3-object-tags.ts"].base64sha256
  handler          = "get-s3-object-tags.handler"

  log_retention_in_days = var.log_retention_in_days

  execution_role_policy_document = data.aws_iam_policy_document.get_s3_object_tags.json
}

data "aws_iam_policy_document" "get_s3_object_tags" {

  statement {
    sid    = "AllowS3Read"
    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:GetObjectVersion",
      "s3:GetObjectTagging",
      "s3:GetObjectVersionTagging",
    ]

    resources = ["${module.s3bucket_quarantine.arn}/*"]
  }
}
