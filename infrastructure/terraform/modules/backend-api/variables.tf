##
# Basic Required Variables for tfscaffold Components
##

variable "project" {
  type        = string
  description = "The name of the tfscaffold project"
}

variable "environment" {
  type        = string
  description = "The name of the tfscaffold environment"
}

variable "component" {
  type        = string
  description = "The variable encapsulating the name of this component"
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
  description = "The group variables are being inherited from (often synonmous with account short-name)"
}

##
# tfscaffold variables specific to this component
##

variable "module" {
  type        = string
  description = "The variable encapsulating the name of this module"
  default     = "api"
}

##
# Variables specific to this component
##

variable "csi" {
  type        = string
  description = "CSI from the parent component"
}

variable "log_retention_in_days" {
  type        = number
  description = "The retention period in days for the Cloudwatch Logs events to be retained, default of 0 is indefinite"
  default     = 0
}

variable "cognito_config" {
  type = object({
    USER_POOL_ID : string,
    USER_POOL_CLIENT_ID : string
  })
  description = "Cognito config"
}

variable "enable_backup" {
  type        = bool
  description = "Enable Backups for the DynamoDB table?"
  default     = true
}

variable "enable_letters" {
  type        = bool
  description = "Enable letters feature flag"
}

variable "kms_key_arn" {
  type        = string
  description = "KMS Key ARN"
}

variable "dynamodb_kms_key_arn" {
  type        = string
  description = "KMS Key ARN for encrypting DynamoDB data. If not given, a key will be created."
  default     = ""
}

variable "letter_suppliers" {
  type = map(object({
    enable_polling   = bool
    default_supplier = optional(bool)
  }))
  description = "Letter suppliers enabled in the environment"
}

variable "parent_acct_environment" {
  type        = string
  description = "Name of the environment responsible for the acct resources used"
}
