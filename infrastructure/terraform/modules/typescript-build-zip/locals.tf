locals {
  entrypoint_stem_map = { for entrypoint in var.entrypoints : entrypoint => trimsuffix(basename(entrypoint), ".ts") }

  external_flags = join(" ", [for external in var.externals : "--external:${external}"])
}
