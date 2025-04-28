resource "aws_lambda_layer_version" "lambda_layer_pdfjs" {
  layer_name          = "${local.csi}-nodejs20-pdfjs-dist"
  description         = "pdfjs-dist dependencies for Node.js v20"
  filename            = local.pdfjs_layer_zip
  compatible_runtimes = ["nodejs20.x"]
}
