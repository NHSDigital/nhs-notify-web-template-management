<!-- BEGIN_TF_DOCS -->
<!-- markdownlint-disable -->
<!-- vale off -->

## Requirements

No requirements.
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_aws_account_id"></a> [aws\_account\_id](#input\_aws\_account\_id) | The AWS Account ID (numeric) | `string` | n/a | yes |
| <a name="input_cloudfront_distribution_arn"></a> [cloudfront\_distribution\_arn](#input\_cloudfront\_distribution\_arn) | ARN of the cloudfront distribution to serve files from | `string` | `null` | no |
| <a name="input_cognito_config"></a> [cognito\_config](#input\_cognito\_config) | Cognito config | <pre>object({<br/>    USER_POOL_ID : string,<br/>    USER_POOL_CLIENT_ID : string<br/>  })</pre> | n/a | yes |
| <a name="input_component"></a> [component](#input\_component) | The variable encapsulating the name of this component | `string` | n/a | yes |
| <a name="input_csi"></a> [csi](#input\_csi) | CSI from the parent component | `string` | n/a | yes |
| <a name="input_dynamodb_kms_key_arn"></a> [dynamodb\_kms\_key\_arn](#input\_dynamodb\_kms\_key\_arn) | KMS Key ARN for encrypting DynamoDB data. If not given, a key will be created. | `string` | `""` | no |
| <a name="input_enable_backup"></a> [enable\_backup](#input\_enable\_backup) | Enable Backups for the DynamoDB table? | `bool` | `true` | no |
| <a name="input_enable_proofing"></a> [enable\_proofing](#input\_enable\_proofing) | Enable proofing feature flag | `bool` | n/a | yes |
| <a name="input_environment"></a> [environment](#input\_environment) | The name of the tfscaffold environment | `string` | n/a | yes |
| <a name="input_function_s3_bucket"></a> [function\_s3\_bucket](#input\_function\_s3\_bucket) | Name of S3 bucket to upload lambda artefacts to | `string` | n/a | yes |
| <a name="input_group"></a> [group](#input\_group) | The group variables are being inherited from (often synonmous with account short-name) | `string` | n/a | yes |
| <a name="input_kms_key_arn"></a> [kms\_key\_arn](#input\_kms\_key\_arn) | KMS Key ARN | `string` | n/a | yes |
| <a name="input_letter_suppliers"></a> [letter\_suppliers](#input\_letter\_suppliers) | Letter suppliers enabled in the environment | <pre>map(object({<br/>    enable_polling   = bool<br/>    default_supplier = optional(bool)<br/>  }))</pre> | n/a | yes |
| <a name="input_log_destination_arn"></a> [log\_destination\_arn](#input\_log\_destination\_arn) | Destination ARN to use for the log subscription filter | `string` | `""` | no |
| <a name="input_log_retention_in_days"></a> [log\_retention\_in\_days](#input\_log\_retention\_in\_days) | The retention period in days for the Cloudwatch Logs events to be retained, default of 0 is indefinite | `number` | `0` | no |
| <a name="input_log_subscription_role_arn"></a> [log\_subscription\_role\_arn](#input\_log\_subscription\_role\_arn) | The ARN of the IAM role to use for the log subscription filter | `string` | `""` | no |
| <a name="input_module"></a> [module](#input\_module) | The variable encapsulating the name of this module | `string` | `"api"` | no |
| <a name="input_parent_acct_environment"></a> [parent\_acct\_environment](#input\_parent\_acct\_environment) | Name of the environment responsible for the acct resources used | `string` | n/a | yes |
| <a name="input_project"></a> [project](#input\_project) | The name of the tfscaffold project | `string` | n/a | yes |
| <a name="input_region"></a> [region](#input\_region) | The AWS Region | `string` | n/a | yes |
| <a name="input_send_to_firehose"></a> [send\_to\_firehose](#input\_send\_to\_firehose) | Flag indicating whether logs should be sent to firehose | `bool` | n/a | yes |
## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_authorizer_lambda"></a> [authorizer\_lambda](#module\_authorizer\_lambda) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda | v2.0.4 |
| <a name="module_create_letter_template_lambda"></a> [create\_letter\_template\_lambda](#module\_create\_letter\_template\_lambda) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda | v2.0.4 |
| <a name="module_create_template_lambda"></a> [create\_template\_lambda](#module\_create\_template\_lambda) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda | v2.0.4 |
| <a name="module_delete_template_lambda"></a> [delete\_template\_lambda](#module\_delete\_template\_lambda) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda | v2.0.4 |
| <a name="module_get_template_lambda"></a> [get\_template\_lambda](#module\_get\_template\_lambda) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda | v2.0.4 |
| <a name="module_lambda_copy_scanned_object_to_internal"></a> [lambda\_copy\_scanned\_object\_to\_internal](#module\_lambda\_copy\_scanned\_object\_to\_internal) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda | v2.0.4 |
| <a name="module_lambda_delete_failed_scanned_object"></a> [lambda\_delete\_failed\_scanned\_object](#module\_lambda\_delete\_failed\_scanned\_object) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda | v2.0.4 |
| <a name="module_lambda_process_proof"></a> [lambda\_process\_proof](#module\_lambda\_process\_proof) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda | v2.0.4 |
| <a name="module_lambda_send_letter_proof"></a> [lambda\_send\_letter\_proof](#module\_lambda\_send\_letter\_proof) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda | v2.0.4 |
| <a name="module_lambda_set_file_virus_scan_status_for_upload"></a> [lambda\_set\_file\_virus\_scan\_status\_for\_upload](#module\_lambda\_set\_file\_virus\_scan\_status\_for\_upload) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda | v2.0.4 |
| <a name="module_lambda_sftp_poll"></a> [lambda\_sftp\_poll](#module\_lambda\_sftp\_poll) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda | v2.0.4 |
| <a name="module_lambda_validate_letter_template_files"></a> [lambda\_validate\_letter\_template\_files](#module\_lambda\_validate\_letter\_template\_files) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda | v2.0.4 |
| <a name="module_list_template_lambda"></a> [list\_template\_lambda](#module\_list\_template\_lambda) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda | v2.0.4 |
| <a name="module_request_proof_lambda"></a> [request\_proof\_lambda](#module\_request\_proof\_lambda) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda | v2.0.4 |
| <a name="module_s3bucket_download"></a> [s3bucket\_download](#module\_s3bucket\_download) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/s3bucket | v2.0.2 |
| <a name="module_s3bucket_internal"></a> [s3bucket\_internal](#module\_s3bucket\_internal) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/s3bucket | v1.0.8 |
| <a name="module_s3bucket_quarantine"></a> [s3bucket\_quarantine](#module\_s3bucket\_quarantine) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/s3bucket | v1.0.8 |
| <a name="module_sqs_sftp_upload"></a> [sqs\_sftp\_upload](#module\_sqs\_sftp\_upload) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/sqs | v2.0.1 |
| <a name="module_sqs_validate_letter_template_files"></a> [sqs\_validate\_letter\_template\_files](#module\_sqs\_validate\_letter\_template\_files) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/sqs | v2.0.1 |
| <a name="module_submit_template_lambda"></a> [submit\_template\_lambda](#module\_submit\_template\_lambda) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda | v2.0.4 |
| <a name="module_update_template_lambda"></a> [update\_template\_lambda](#module\_update\_template\_lambda) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda | v2.0.4 |
## Outputs

| Name | Description |
|------|-------------|
| <a name="output_api_base_url"></a> [api\_base\_url](#output\_api\_base\_url) | n/a |
| <a name="output_download_bucket_name"></a> [download\_bucket\_name](#output\_download\_bucket\_name) | n/a |
| <a name="output_download_bucket_regional_domain_name"></a> [download\_bucket\_regional\_domain\_name](#output\_download\_bucket\_regional\_domain\_name) | n/a |
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
