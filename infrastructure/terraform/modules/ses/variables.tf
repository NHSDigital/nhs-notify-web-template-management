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
  description = "The name of the tfscaffold component"
}

variable "aws_account_id" {
  type        = string
  description = "The AWS Account ID (numeric)"
}

variable "region" {
  type        = string
  description = "The AWS Region"
}

variable "root_domain_name" {
  type        = string
  description = "Root domain name"
}

variable "external_email_domain" {
  type        = string
  description = "External email domain"
  default     = null
}

variable "zone_id" {
  type        = string
  description = "Route53 zone ID"
}
