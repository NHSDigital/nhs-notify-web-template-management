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

variable "kms_key_arn" {
  type        = string
  description = "KMS Key ARN"
}

variable "letter_suppliers" {
  type = map(object({
    email_addresses  = list(string)
    enable_polling   = bool
    default_supplier = optional(bool)
  }))
  description = "Letter suppliers enabled in the environment"
}

variable "parent_acct_environment" {
  type        = string
  description = "Name of the environment responsible for the acct resources used"
}

variable "cloudfront_distribution_arn" {
  type        = string
  description = "ARN of the cloudfront distribution to serve files from"
  default     = null
}

variable "log_destination_arn" {
  type        = string
  description = "Destination ARN to use for the log subscription filter"
  default     = ""
}

variable "send_to_firehose" {
  type        = bool
  description = "Flag indicating whether logs should be sent to firehose"
  default     = true
}

variable "log_subscription_role_arn" {
  type        = string
  description = "The ARN of the IAM role to use for the log subscription filter"
  default     = ""
}

variable "function_s3_bucket" {
  type        = string
  description = "Name of S3 bucket to upload lambda artefacts to"
}

variable "email_domain" {
  type        = string
  description = "Email domain"
}

variable "template_submitted_sender_email_address" {
  type        = string
  description = "Template submitted sender email address"
}

variable "proof_requested_sender_email_address" {
  type        = string
  description = "Proof requested sender email address"
}

variable "sns_topic_arn" {
  type        = string
  description = "SNS topic ARN"
  default     = null
}
