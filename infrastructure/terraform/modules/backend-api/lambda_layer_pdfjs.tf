resource "aws_lambda_layer_version" "lambda_layer_pdfjs" {
  layer_name          = "${local.csi}-nodejs24-pdfjs-dist"
  description         = "pdfjs-dist dependencies for Node.js v24"
  filename            = local.pdfjs_layer_zip
  source_code_hash    = filebase64sha256(local.pdfjs_layer_lockfile)
  compatible_runtimes = ["nodejs22.x"]
}
