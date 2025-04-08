module "lambda_layer_pdfjs" {
  source                 = "../lambda_layer"
  name                   = "${local.csi}-nodejs20-pdfjs-dist"
  description            = "pdfjs-dist dependencies for Node.js v20"
  source_code_dir        = local.pdfjs_layer_source_code_dir
  nodejs_runtime_version = "20"
}
