variable "csi" {
  type        = string
  description = "CSI from the parent component"
}

variable "id" {
  type        = string
  description = "ID for the module instance"
}

variable "source_bucket" {
  description = "Source bucket details"
  type = object({
    name : string
  })
}

variable "kms_key_arn" {
  type        = string
  description = "ARN of KMS Key used for encrypting application data"
}

