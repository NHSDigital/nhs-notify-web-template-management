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

variable "component" {
  type        = string
  description = "The name of the component"
  default     = "amplify-app"
}

variable "repository" {
  type    = string
  default = "https://github.com/NHSDigital/nhs-notify-web-template-management-infrastructure-testing"
}

variable "access_token" {
  type    = string
  default = null
}
