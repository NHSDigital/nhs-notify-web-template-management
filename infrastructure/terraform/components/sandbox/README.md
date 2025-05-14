<!-- BEGIN_TF_DOCS -->
<!-- markdownlint-disable -->
<!-- vale off -->

## Requirements

No requirements.
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_aws_account_id"></a> [aws\_account\_id](#input\_aws\_account\_id) | The AWS Account ID (numeric) | `string` | n/a | yes |
| <a name="input_component"></a> [component](#input\_component) | The variable encapsulating the name of this component | `string` | `"sbx"` | no |
| <a name="input_default_tags"></a> [default\_tags](#input\_default\_tags) | A map of default tags to apply to all taggable resources within the component | `map(string)` | `{}` | no |
| <a name="input_environment"></a> [environment](#input\_environment) | The name of the tfscaffold environment | `string` | n/a | yes |
| <a name="input_group"></a> [group](#input\_group) | The group variables are being inherited from (often synonymous with account short-name) | `string` | n/a | yes |
| <a name="input_kms_deletion_window"></a> [kms\_deletion\_window](#input\_kms\_deletion\_window) | When a kms key is deleted, how long should it wait in the pending deletion state? | `string` | `"30"` | no |
| <a name="input_letter_suppliers"></a> [letter\_suppliers](#input\_letter\_suppliers) | Letter suppliers enabled in the environment | <pre>map(object({<br/>    enable_polling   = bool<br/>    default_supplier = optional(bool)<br/>  }))</pre> | <pre>{<br/>  "WTMMOCK": {<br/>    "default_supplier": true,<br/>    "enable_polling": true<br/>  }<br/>}</pre> | no |
| <a name="input_log_retention_in_days"></a> [log\_retention\_in\_days](#input\_log\_retention\_in\_days) | The retention period in days for the Cloudwatch Logs events to be retained, default of 0 is indefinite | `number` | `0` | no |
| <a name="input_project"></a> [project](#input\_project) | The name of the tfscaffold project | `string` | n/a | yes |
| <a name="input_region"></a> [region](#input\_region) | The AWS Region | `string` | n/a | yes |
## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_backend_api"></a> [backend\_api](#module\_backend\_api) | ../../modules/backend-api | n/a |
## Outputs

| Name | Description |
|------|-------------|
| <a name="output_api_base_url"></a> [api\_base\_url](#output\_api\_base\_url) | n/a |
| <a name="output_cognito_user_pool_client_id"></a> [cognito\_user\_pool\_client\_id](#output\_cognito\_user\_pool\_client\_id) | n/a |
| <a name="output_cognito_user_pool_id"></a> [cognito\_user\_pool\_id](#output\_cognito\_user\_pool\_id) | n/a |
| <a name="output_internal_bucket_name"></a> [internal\_bucket\_name](#output\_internal\_bucket\_name) | n/a |
| <a name="output_quarantine_bucket_name"></a> [quarantine\_bucket\_name](#output\_quarantine\_bucket\_name) | n/a |
| <a name="output_send_proof_queue_url"></a> [send\_proof\_queue\_url](#output\_send\_proof\_queue\_url) | n/a |
| <a name="output_sftp_environment"></a> [sftp\_environment](#output\_sftp\_environment) | n/a |
| <a name="output_sftp_mock_credential_path"></a> [sftp\_mock\_credential\_path](#output\_sftp\_mock\_credential\_path) | n/a |
| <a name="output_sftp_poll_lambda_name"></a> [sftp\_poll\_lambda\_name](#output\_sftp\_poll\_lambda\_name) | n/a |
| <a name="output_templates_table_name"></a> [templates\_table\_name](#output\_templates\_table\_name) | n/a |
<!-- vale on -->
<!-- markdownlint-enable -->
<!-- END_TF_DOCS -->
