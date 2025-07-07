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

variable "component" {
  type        = string
  description = "The variable encapsulating the name of this component"
}

variable "zone_id" {
  type        = string
  description = "Route53 zone ID"
}

variable "root_domain_name" {
  type        = string
  description = "Root domain name"
}

variable "kms_key_arn" {
  type        = string
  description = "KMS key ARN"
}
