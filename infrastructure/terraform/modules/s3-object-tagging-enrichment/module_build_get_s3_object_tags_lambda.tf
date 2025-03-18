module "build_get_s3_object_tags_lambda" {
  source = "../typescript-build-zip"

  source_code_dir = abspath("${path.module}/../../../../lambdas/get-s3-object-tags")

  entrypoints = [
    "src/get-s3-object-tags.ts"
  ]
}

