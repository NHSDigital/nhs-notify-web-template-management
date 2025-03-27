module "build_virus_scan_lambdas" {
  source = "../typescript-build-zip"

  source_code_dir = abspath("${path.module}/../../../../lambdas/virus-scan")

  entrypoints = [
    "src/copy-scanned-object-to-internal.ts",
    "src/delete-failed-scanned-object.ts",
    "src/enrich-guardduty-scan-result.ts"
  ]
}
