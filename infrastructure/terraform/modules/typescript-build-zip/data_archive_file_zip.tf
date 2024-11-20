data "archive_file" "zip" {
  depends_on  = [null_resource.typescript_build]
  type        = "zip"
  source_file = "${var.source_code_dir}/.build/${local.entrypoint_stem}.js"
  output_path = "${var.source_code_dir}/.build/${local.entrypoint_stem}.zip"
}
