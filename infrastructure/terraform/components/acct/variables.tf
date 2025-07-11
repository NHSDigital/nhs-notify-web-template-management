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
  default     = "acct"
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

variable "root_domain_name" {
  type        = string
  description = "The service's root DNS root nameespace, like nonprod.nhsnotify.national.nhs.uk"
  default     = "nonprod.nhsnotify.national.nhs.uk"
}

variable "initial_cli_secrets_provision_override" {
  type        = map(string)
  description = "A map of default value to intialise SSM secret values with. Only useful for initial setup of the account due to lifecycle rules."
  default     = {}
  # Usage like:
  #  ... -a apply -- -var initial_cli_secrets_provision_override={\"github_pat\":\"l0ngstr1ng"}
}

variable "observability_account_id" {
  type        = string
  description = "The Observability Account ID that needs access"
}

variable "kms_deletion_window" {
  type        = string
  description = "When a kms key is deleted, how long should it wait in the pending deletion state?"
  default     = "30"
}

variable "support_sandbox_environments" {
  type        = bool
  description = "Does this account support dev sandbox environments?"
  default     = false
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "vpc_subnet_cidr_bits" {
  type = object({
    public  = number
    private = number
  })
  description = "Number of additional bits to use for subnetting the VPC CIDR block. The bits are evently distributed "
  default = {
    public  = 12 # Smaller subnets for public resources. 12 creates /28 subnets over 3x Az
    private = 3  # Larger subnets for private resources, 3 creates /19 subnets over 3x Az
  }
}

variable "letter_suppliers" {
  type = map(object({
    enable_polling   = bool
    default_supplier = optional(bool)
  }))
  description = "Letter suppliers enabled in the account (across all environments)"

  default = {}
}

variable "oam_sink_id" {
  description = "The ID of the Cloudwatch OAM sink in the appropriate observability account."
  type        = string
  default     = ""
}

variable "cost_alarm_recipients" {
  type        = list(string)
  description = "A list of email addresses to receive alarm notifications"
  default     = []
}

variable "budget_amount" {
  type        = number
  description = "The budget amount in USD for the account"
  default     = 500
}

variable "cost_anomaly_threshold" {
  type        = number
  description = "The threshold percentage for cost anomaly detection"
  default     = 10
}
