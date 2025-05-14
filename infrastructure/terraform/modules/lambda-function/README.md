<!-- BEGIN_TF_DOCS -->
<!-- markdownlint-disable -->
<!-- vale off -->

## Requirements

No requirements.
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_cloudwatch_log_destination_arn"></a> [cloudwatch\_log\_destination\_arn](#input\_cloudwatch\_log\_destination\_arn) | Destination ARN to use for the log subscription filter | `string` | `""` | no |
| <a name="input_dead_letter_target_arn"></a> [dead\_letter\_target\_arn](#input\_dead\_letter\_target\_arn) | The ARN of an SNS topic or SQS queue to notify when an async invocation fails. | `string` | `null` | no |
| <a name="input_description"></a> [description](#input\_description) | Description of what your Lambda Function does | `string` | n/a | yes |
| <a name="input_environment_variables"></a> [environment\_variables](#input\_environment\_variables) | Lambda environment variables | `map(string)` | `{}` | no |
| <a name="input_execution_role_policy_document"></a> [execution\_role\_policy\_document](#input\_execution\_role\_policy\_document) | IAM Policy Document containing additional runtime permissions for the Lambda function beyond the basic execution policy | `string` | `""` | no |
| <a name="input_filename"></a> [filename](#input\_filename) | Path to the function's deployment package within the local filesystem | `string` | n/a | yes |
| <a name="input_filter_pattern"></a> [filter\_pattern](#input\_filter\_pattern) | Filter pattern to use for the log subscription filter | `string` | `""` | no |
| <a name="input_function_name"></a> [function\_name](#input\_function\_name) | Unique name of the Lambda function | `string` | n/a | yes |
| <a name="input_handler"></a> [handler](#input\_handler) | Function entrypoint in your code | `string` | n/a | yes |
| <a name="input_layer_arns"></a> [layer\_arns](#input\_layer\_arns) | List of Lambda Layer Version ARNs (maximum of 5) to attach to your Lambda Function. | `list(string)` | `null` | no |
| <a name="input_log_retention_in_days"></a> [log\_retention\_in\_days](#input\_log\_retention\_in\_days) | Specifies the number of days you want to retain log events in the log group for this Lambda | `number` | `0` | no |
| <a name="input_log_subscription_role_arn"></a> [log\_subscription\_role\_arn](#input\_log\_subscription\_role\_arn) | The ARN of the IAM role to use for the log subscription filter | `string` | `""` | no |
| <a name="input_memory_size"></a> [memory\_size](#input\_memory\_size) | Lambda memory size | `number` | `128` | no |
| <a name="input_runtime"></a> [runtime](#input\_runtime) | Identifier of the function's runtime | `string` | `"nodejs20.x"` | no |
| <a name="input_source_code_hash"></a> [source\_code\_hash](#input\_source\_code\_hash) | Base64-encoded SHA256 hash of the package file specified by `filename` | `string` | n/a | yes |
| <a name="input_sqs_event_source_mapping"></a> [sqs\_event\_source\_mapping](#input\_sqs\_event\_source\_mapping) | Configuration for SQS event source mapping | <pre>object({<br/>    sqs_queue_arn                      = string<br/>    batch_size                         = optional(number, 10)<br/>    maximum_batching_window_in_seconds = optional(number, 0)<br/>    scaling_config = optional(object({<br/>      maximum_concurrency = number<br/>    }), null)<br/>  })</pre> | `null` | no |
| <a name="input_timeout"></a> [timeout](#input\_timeout) | Maximum running time before timeout | `number` | `3` | no |
| <a name="input_vpc"></a> [vpc](#input\_vpc) | VPC details | <pre>object({<br/>    id                 = string<br/>    cidr_block         = string<br/>    subnet_ids         = set(string)<br/>    security_group_ids = list(string)<br/>  })</pre> | `null` | no |
## Modules

No modules.
## Outputs

| Name | Description |
|------|-------------|
| <a name="output_function_arn"></a> [function\_arn](#output\_function\_arn) | n/a |
| <a name="output_function_name"></a> [function\_name](#output\_function\_name) | n/a |
<!-- vale on -->
<!-- markdownlint-enable -->
<!-- END_TF_DOCS -->
