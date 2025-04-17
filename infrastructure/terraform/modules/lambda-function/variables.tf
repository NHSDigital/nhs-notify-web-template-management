variable "description" {
  type        = string
  description = "Description of what your Lambda Function does"
}

variable "execution_role_policy_document" {
  type        = string
  description = "IAM Policy Document containing additional runtime permissions for the Lambda function beyond the basic execution policy"
  default     = ""
}

variable "filename" {
  type        = string
  description = "Path to the function's deployment package within the local filesystem"
}

variable "function_name" {
  type        = string
  description = "Unique name of the Lambda function"
}

variable "source_code_hash" {
  type        = string
  description = "Base64-encoded SHA256 hash of the package file specified by `filename`"
}

variable "handler" {
  type        = string
  description = "Function entrypoint in your code"
}

variable "runtime" {
  type        = string
  description = "Identifier of the function's runtime"
  default     = "nodejs20.x"
}

variable "timeout" {
  type        = number
  description = "Maximum running time before timeout"
  default     = 3
}

variable "log_retention_in_days" {
  type        = number
  description = "Specifies the number of days you want to retain log events in the log group for this Lambda"
  default     = 0
}

variable "environment_variables" {
  type        = map(string)
  description = "Lambda environment variables"
  default     = {}
}

variable "memory_size" {
  type        = number
  description = "Lambda memory size"
  default     = 128
}

variable "dead_letter_target_arn" {
  description = "The ARN of an SNS topic or SQS queue to notify when an async invocation fails."
  type        = string
  default     = null
}

variable "vpc" {
  description = "VPC details"
  type = object({
    id                 = string
    cidr_block         = string
    subnet_ids         = set(string)
    security_group_ids = list(string)
  })
  default = null
}

variable "sqs_event_source_mapping" {
  description = "Configuration for SQS event source mapping"
  type = object({
    sqs_queue_arn                      = string
    batch_size                         = optional(number, 10)
    maximum_batching_window_in_seconds = optional(number, 0)
    scaling_config = optional(object({
      maximum_concurrency = number
    }), null)
  })
  default = null
}
