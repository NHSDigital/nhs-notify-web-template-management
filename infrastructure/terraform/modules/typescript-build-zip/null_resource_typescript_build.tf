resource "null_resource" "typescript_build" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    working_dir = var.source_code_dir
    command     = "rm -rf ${var.output_dir} && npm ci && npx esbuild --bundle --minify ${var.include_sourcemaps ? "--sourcemap=inline" : ""} --target=es2020 --platform=node --outdir=${var.output_dir} ${join(" ", var.entrypoints)}"
  }
}
