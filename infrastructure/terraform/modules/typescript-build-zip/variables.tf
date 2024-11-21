variable "source_code_dir" {
  type        = string
  description = "Path to the root directory of the TypeScript project to build"
}

variable "entrypoint" {
  type        = string
  description = "Entrypoint filename"

  validation {
    condition     = endswith(var.entrypoint, ".ts")
    error_message = "Entrypoint must be a TypeScript file with .ts extension"
  }
}
