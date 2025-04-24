module "build_sftp_letters_lambdas" {
  source = "../typescript-build-zip"

  source_code_dir = abspath("${path.module}/../../../../lambdas/sftp-letters")

  entrypoints = [
    "src/send-proof.ts",
    "src/sftp-poll.ts",
  ]
}
