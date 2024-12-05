resource "null_resource" "typescript_build" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    working_dir = var.source_code_dir
    command     = "rm -rf ${var.output_dir} && npx esbuild --bundle --minify --sourcemap --target=es2020 --platform=node --outdir=${var.output_dir} ${join(" ", var.entrypoints)}"
  }
}
