locals {
  entrypoint_stem = trimsuffix(var.entrypoint, ".ts")

  output_path = "${var.source_code_dir}/.build/${local.entrypoint_stem}.zip"
}
