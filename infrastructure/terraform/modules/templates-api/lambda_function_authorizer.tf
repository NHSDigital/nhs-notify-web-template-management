data "archive_file" "authorizer_lambda" {
  depends_on  = [null_resource.typescript_build]
  type        = "zip"
  source_file = "${local.api_source_code_dir}/.build/authorizer.js"
  output_path = "${local.api_source_code_dir}/.build/authorizer.zip"
}

module "authorizer_lambda" {
  source      = "../lambda-function"
  description = "templates api authorizer"

  function_name    = "${local.csi}-authorizer"
  filename         = data.archive_file.authorizer_lambda.output_path
  source_code_hash = data.archive_file.authorizer_lambda.output_base64sha256
  handler          = "authorizer.handler"

  log_retention_in_days = var.log_retention_in_days
}
