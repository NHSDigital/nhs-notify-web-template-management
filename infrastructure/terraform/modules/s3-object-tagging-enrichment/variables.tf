// tfscaffold variables
variable "project" {
  type        = string
  description = "The name of the tfscaffold project"
}

variable "environment" {
  type        = string
  description = "The name of the tfscaffold environment"
}

variable "aws_account_id" {
  type        = string
  description = "The AWS Account ID (numeric)"
}

variable "region" {
  type        = string
  description = "The AWS Region"
}

variable "group" {
  type        = string
  description = "The group variables are being inherited from (often synonymous with account short-name)"
}

variable "component" {
  type        = string
  description = "The variable encapsulating the name of this component"
}

// module variables
variable "source_csi" {
  type        = string
  description = "CSI from the parent component"
}

variable "id" {
  type        = string
  description = "ID for the module instance"
}

variable "log_retention_in_days" {
  type        = number
  description = "The retention period in days for the Cloudwatch Logs events to be retained, default of 0 is indefinite"
  default     = 0
}

variable "source_bucket" {
  description = "Source bucket details"
  type = object({
    arn : string
    name : string
  })
}

variable "kms_key_arn" {
  type        = string
  description = "ARN of KMS Key used for encrypting application data"
}

variable "target_event_bus_arn" {
  type        = string
  description = "ARN of the event bus to send tag-enrichment events to"
}

variable "output_event_source" {
  type        = string
  description = "the value of the 'source' field on the emitted events"
}
