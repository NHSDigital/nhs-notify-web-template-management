resource "null_resource" "typescript_build" {
  provisioner "local-exec" {
    working_dir = local.api_source_code_dir
    command     = "npm ci && npm run build"
  }
}
