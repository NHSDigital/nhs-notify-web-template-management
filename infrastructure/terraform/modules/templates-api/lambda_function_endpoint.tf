data "archive_file" "endpoint_lambda" {
  depends_on  = [null_resource.typescript_build]
  type        = "zip"
  source_file = "${local.api_source_code_dir}/.build/endpoint.js"
  output_path = "${local.api_source_code_dir}/.build/endpoint.zip"
}

module "endpoint_lambda" {
  source      = "../lambda-function"
  description = "templates api endpoint"

  function_name    = "${local.csi}-endpoint"
  filename         = data.archive_file.endpoint_lambda.output_path
  source_code_hash = data.archive_file.endpoint_lambda.output_base64sha256
  handler          = "endpoint.handler"

  log_retention_in_days = var.log_retention_in_days
}
