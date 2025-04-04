<!-- BEGIN_TF_DOCS -->
<!-- markdownlint-disable -->
<!-- vale off -->

## Requirements

No requirements.
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_dead_letter_target_arn"></a> [dead\_letter\_target\_arn](#input\_dead\_letter\_target\_arn) | The ARN of an SNS topic or SQS queue to notify when an async invocation fails. | `string` | `null` | no |
| <a name="input_description"></a> [description](#input\_description) | Description of what your Lambda Function does | `string` | n/a | yes |
| <a name="input_environment_variables"></a> [environment\_variables](#input\_environment\_variables) | Lambda environment variables | `map(string)` | `{}` | no |
| <a name="input_execution_role_policy_document"></a> [execution\_role\_policy\_document](#input\_execution\_role\_policy\_document) | IAM Policy Document containing additional runtime permissions for the Lambda function beyond the basic execution policy | `string` | `""` | no |
| <a name="input_filename"></a> [filename](#input\_filename) | Path to the function's deployment package within the local filesystem | `string` | n/a | yes |
| <a name="input_function_name"></a> [function\_name](#input\_function\_name) | Unique name of the Lambda function | `string` | n/a | yes |
| <a name="input_handler"></a> [handler](#input\_handler) | Function entrypoint in your code | `string` | n/a | yes |
| <a name="input_log_retention_in_days"></a> [log\_retention\_in\_days](#input\_log\_retention\_in\_days) | Specifies the number of days you want to retain log events in the log group for this Lambda | `number` | `0` | no |
| <a name="input_memory_size"></a> [memory\_size](#input\_memory\_size) | Lambda memory size | `number` | `128` | no |
| <a name="input_runtime"></a> [runtime](#input\_runtime) | Identifier of the function's runtime | `string` | `"nodejs20.x"` | no |
| <a name="input_source_code_hash"></a> [source\_code\_hash](#input\_source\_code\_hash) | Base64-encoded SHA256 hash of the package file specified by `filename` | `string` | n/a | yes |
## Modules

No modules.
## Outputs

| Name | Description |
|------|-------------|
| <a name="output_function_arn"></a> [function\_arn](#output\_function\_arn) | n/a |
<!-- vale on -->
<!-- markdownlint-enable -->
<!-- END_TF_DOCS -->
