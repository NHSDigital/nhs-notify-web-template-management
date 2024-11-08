resource "null_resource" "typescript_build" {
  provisioner "local-exec" {
    command = "cd ${abspath("${path.module}/../../../../lambdas/api")} && npm ci && npm run build"
  }
}
