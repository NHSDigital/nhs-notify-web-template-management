resource "null_resource" "package_layer" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    working_dir = var.source_code_dir
    command     = "rm -rf $OUTPUT_DIR/layer node_modules"
    environment = {
      OUTPUT_DIR = var.output_dir
    }
  }

  provisioner "local-exec" {
    working_dir = var.source_code_dir
    command     = "mkdir -p $OUTPUT_DIR/layer/nodejs/node_modules"
    environment = {
      OUTPUT_DIR = var.output_dir
    }
  }

  provisioner "local-exec" {
    working_dir = var.source_code_dir
    command     = "npm install --force"
  }

  provisioner "local-exec" {
    working_dir = var.source_code_dir
    command     = "cp -r node_modules/* $OUTPUT_DIR/layer/nodejs/node_modules"
    environment = {
      OUTPUT_DIR = var.output_dir
    }
  }
}
