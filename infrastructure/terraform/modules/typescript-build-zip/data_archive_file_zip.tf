data "archive_file" "zip" {
  for_each = local.entrypoint_stem_map

  depends_on  = [null_resource.typescript_build]
  type        = "zip"
  output_path = "${var.source_code_dir}/${var.output_dir}/${each.value}.zip"
  source_file = "${var.source_code_dir}/${var.output_dir}/${each.value}.js"
}
