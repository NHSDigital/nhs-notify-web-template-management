resource "aws_lambda_layer_version" "pdfjs" {
  layer_name          = "${local.csi}-nodejs20-pdfjs-dist"
  description         = "pdfjs-dist dependencies for nodejs20.x"
  filename            = local.pdfjs_layer_filepath
  source_code_hash    = filebase64sha256(local.pdfjs_layer_filepath)
  compatible_runtimes = ["nodejs20.x"]
}
