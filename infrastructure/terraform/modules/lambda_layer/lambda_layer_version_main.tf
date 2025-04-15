resource "aws_lambda_layer_version" "lambda_layer" {
  depends_on          = [data.archive_file.zip]
  layer_name          = var.name
  description         = var.description
  filename            = data.archive_file.zip.output_path
  source_code_hash    = data.archive_file.zip.output_base64sha256
  compatible_runtimes = ["nodejs${var.nodejs_runtime_version}.x"]
}
