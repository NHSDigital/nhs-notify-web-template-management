resource "aws_lambda_layer_version" "lambda_layer_pdfjs" {
  layer_name          = "${local.csi}-nodejs20-pdfjs-dist"
  description         = "pdfjs-dist dependencies for Node.js v20"
  filename            = local.pdfjs_layer_zip
  source_code_hash    = filebase64sha256(local.pdfjs_layer_lockfile)
  compatible_runtimes = ["nodejs24.x"]
}
