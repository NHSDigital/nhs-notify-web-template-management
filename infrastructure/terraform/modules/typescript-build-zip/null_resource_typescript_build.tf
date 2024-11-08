resource "null_resource" "typescript_build" {
  provisioner "local-exec" {
    working_dir = var.source_code_dir
    command     = "npm ci && npm run build"
  }
}

