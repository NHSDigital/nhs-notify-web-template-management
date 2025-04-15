variable "name" {
  type        = string
  description = "Unique name for your Lambda Layer"
}

variable "description" {
  type        = string
  description = "Description of what your Lambda Layer does"
}

variable "layer_dir" {
  type        = string
  description = "Path to the root directory of the layer code"
}

variable "source_dir" {
  type        = string
  description = "Name of the source code directory (relative to layer_dir)"
}

variable "output_dir" {
  type        = string
  description = "Name of the output directory (relative to layer_dir)"
  default     = "dist"
}

variable "nodejs_runtime_version" {
  type        = string
  description = "Node.js runtime version"
  default     = "20"
}
