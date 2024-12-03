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

variable "component" {
  type        = string
  description = "The variable encapsulating the name of this component"
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

variable "template_api_entrypoints" {
  type = object({
    create_template = string
    get_template = string
    update_template = string
    template_client = string
  })
  description = "Entrypoint filenames (relative to source_code_dir)"
  default = {
    create_template  = "src/templates/api/create.ts"
    get_template     = "src/templates/api/get.ts"
    update_template  = "src/templates/api/update.ts"
    template_client  = "src/index.ts"
  }
}
