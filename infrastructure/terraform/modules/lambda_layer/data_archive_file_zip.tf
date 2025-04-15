data "archive_file" "zip" {
  type        = "zip"
  output_path = "${var.layer_dir}/${var.output_dir}/layer.zip"
  source_dir  = "${var.layer_dir}/${var.source_dir}"
}
