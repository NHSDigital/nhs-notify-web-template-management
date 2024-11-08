resource "null_resource" "typescript_build" {
  provisioner "local-exec" {
    command = "cd ${local.api_source_code_directory} && npm ci && npm run build"
  }
}
