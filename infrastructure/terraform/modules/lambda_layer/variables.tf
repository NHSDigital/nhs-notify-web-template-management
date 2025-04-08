variable "name" {
  type        = string
  description = "Unique name for your Lambda Layer"
}

variable "description" {
  type        = string
  description = "Description of what your Lambda Layer does"
}

variable "source_code_dir" {
  type        = string
  description = "Path to the root directory of the project source code"
}

variable "output_dir" {
  type        = string
  description = "Name of the output directory (relative to source_code_dir)"
  default     = "dist"
}

variable "nodejs_runtime_version" {
  type        = string
  description = "Node.js runtime version"
  default     = "20"
}
