data "archive_file" "zip" {
  depends_on  = [null_resource.package_layer]
  type        = "zip"
  output_path = "${var.source_code_dir}/${var.output_dir}/layer.zip"
  source_dir  = "${var.source_code_dir}/${var.output_dir}/layer"
}
