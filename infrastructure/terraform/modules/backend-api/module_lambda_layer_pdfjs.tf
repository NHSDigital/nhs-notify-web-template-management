module "lambda_layer_pdfjs" {
  source                 = "../lambda_layer"
  name                   = "${local.csi}-nodejs20-pdfjs-dist"
  description            = "pdfjs-dist dependencies for nodejs20.x"
  layer_dir              = local.pdfjs_layer_dir
  source_dir             = "dist/layer"
  nodejs_runtime_version = "20"
}
