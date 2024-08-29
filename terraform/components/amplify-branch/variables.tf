variable "project" {
  type        = string
  description = "The name of the Project we are bootstrapping tfscaffold for"
}

variable "account_ids" {
  type        = map(string)
  description = "All AWS Account IDs for this project"
  default     = {}
}

variable "account_name" {
  type        = string
  description = "The name of the AWS Account to deploy into (see globals.tfvars)"
}

variable "region" {
  type        = string
  description = "The AWS Region"
}

variable "environment" {
  type        = string
  description = "The name of the environment"
}

variable "amplify_app_environment" {
  type        = string
  description = "The name of the environment"
  default     = "dev"
}

variable "backend_branch" {
  type        = string
  description = "The name of the branch to use for the Amplify backend"
  default     = "main"
}

variable "component" {
  type        = string
  description = "The name of the component"
  default     = "amplify-branch"
}

variable "group" {
  type        = string
  description = "The group variables are being inherited from (often synonmous with account short-name)"
  default     = "nhs-notify-web-dev"
}

variable "branch_name" {
  type    = string
  default = "main"
}
