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

variable "aws_account_id" {
  type        = string
  description = "The AWS Account ID (numeric)"
}

variable "aws_principal_org_id" {
  type        = string
  description = "The AWS Org ID (numeric)"
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

# This is the only primary variable to have its value defined as
# a default within its declaration in this file, because the variables
# purpose is as an identifier unique to this component, rather
# then to the environment from where all other variables come.
variable "component" {
  type        = string
  description = "The variable encapsulating the name of this component"
  default     = "app"
}

variable "default_tags" {
  type        = map(string)
  description = "A map of default tags to apply to all taggable resources within the component"
  default     = {}
}

##
# Variables specific to the "dnsroot"component
##

variable "log_retention_in_days" {
  type        = number
  description = "The retention period in days for the Cloudwatch Logs events to be retained, default of 0 is indefinite"
  default     = 0
}

variable "kms_deletion_window" {
  type        = string
  description = "When a kms key is deleted, how long should it wait in the pending deletion state?"
  default     = "30"
}

variable "parent_acct_environment" {
  type        = string
  description = "Name of the environment responsible for the acct resources used, affects things like DNS zone. Useful for named dev environments"
  default     = "main"
}

variable "enable_amplify_branch_auto_build" {
  type        = bool
  description = "Enable automatic building of branches"
  default     = false
}

variable "cognito_user_pool_additional_callback_urls" {
  type        = list(string)
  description = "A list of additional callback_urls for the cognito user pool"
  default     = []
}

variable "enable_cognito_built_in_idp" {
  type        = bool
  description = "Enable the use of Cognito as an IDP; CIS2 is prefered"
  default     = false
}

variable "enable_amplify_basic_auth" {
  type        = bool
  description = "Enable a basic set of credentials in the form of a dynamicly generated username and password for the amplify app branches. Not intended for production use"
  default     = true
}

# Github Environments only handles uppercase envvars
variable "AMPLIFY_BASIC_AUTH_SECRET" {
  # Github only does uppercase env vars
  type        = string
  description = "Secret key/password to use for Amplify Basic Auth - This is entended to be read from CI variables and not commited to any codebase"
  default     = "unset"
}

variable "CSRF_SECRET" {
  # Github only does uppercase env vars
  type        = string
  description = "Secure cryptographic key to be used for generating CSRF tokens - This is entended to be read from CI variables and not commited to any codebase"
}

variable "branch_name" {
  type        = string
  description = "The branch name to deploy"
  default     = "main"
}

variable "url_prefix" {
  type        = string
  description = "The url prefix to use for the deployed branch"
  default     = "main"
}

variable "commit_id" {
  type        = string
  description = "The commit to deploy. Must be in the tree for branch_name"
  default     = "HEAD"
}

variable "destination_vault_arn" {
  type        = string
  description = "ARN of the backup vault in the destination account, if this environment should be backed up"
  default     = null
}

variable "backup_schedule_cron" {
  type        = string
  description = "Defines the backup schedule in AWS Cron Expression format"
  default     = "cron(0 2 * * ? *)"
}

variable "retention_period" {
  type        = number
  description = "Backup Vault Retention Period"
  default     = 14
}

variable "backup_report_recipient" {
  type        = string
  description = "Primary recipient of the Backup reports"
  default     = ""
}

variable "enable_event_caching" {
  type        = bool
  description = "Enable caching of events to an S3 bucket"
  default     = true
}

variable "event_delivery_logging" {
  type        = bool
  description = "Enable SNS Event Delivery logging"
  default     = true
}

variable "event_delivery_logging_success_sample_percentage" {
  type        = number
  description = "Enable caching of events to an S3 bucket"
  default     = 0
}

variable "data_plane_bus_arn" {
  type        = string
  description = "Data plane event bus arn"
}

variable "control_plane_bus_arn" {
  type        = string
  description = "Data plane event bus arn"
}

variable "enable_proofing" {
  type        = string
  description = "Feature flag for proofing"
  default     = false
}

variable "observability_account_id" {
  type        = string
  description = "The Observability Account ID that needs access"
}

variable "letter_suppliers" {
  type = map(object({
    email_addresses  = list(string)
    enable_polling   = bool
    default_supplier = optional(bool)
  }))

  validation {
    condition = (
      length(var.letter_suppliers) == 0 ||
      length([for s in values(var.letter_suppliers) : s if s.default_supplier]) == 1
    )
    error_message = "If letter suppliers are configured, exactly one must be default_supplier"
  }

  default = {}

  description = "Letter suppliers enabled in the environment"
}

variable "external_email_domain" {
  type        = string
  default     = null
  description = "Externally managed domain used to create an SES identity for sending emails from. Validation DNS records will need to be manually configured in the DNS provider."
}
