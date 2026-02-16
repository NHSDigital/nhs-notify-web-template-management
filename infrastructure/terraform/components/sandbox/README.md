<!-- BEGIN_TF_DOCS -->
<!-- markdownlint-disable -->
<!-- vale off -->

## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.10.1 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | ~> 6.30 |
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_aws_account_id"></a> [aws\_account\_id](#input\_aws\_account\_id) | The AWS Account ID (numeric) | `string` | n/a | yes |
| <a name="input_component"></a> [component](#input\_component) | The variable encapsulating the name of this component | `string` | `"sbx"` | no |
| <a name="input_default_tags"></a> [default\_tags](#input\_default\_tags) | A map of default tags to apply to all taggable resources within the component | `map(string)` | `{}` | no |
| <a name="input_environment"></a> [environment](#input\_environment) | The name of the tfscaffold environment | `string` | n/a | yes |
| <a name="input_group"></a> [group](#input\_group) | The group variables are being inherited from (often synonymous with account short-name) | `string` | n/a | yes |
| <a name="input_image_tag_suffix"></a> [image\_tag\_suffix](#input\_image\_tag\_suffix) | The short SHA or Release Tag to append to container lambda image tags | `string` | n/a | yes |
| <a name="input_kms_deletion_window"></a> [kms\_deletion\_window](#input\_kms\_deletion\_window) | When a kms key is deleted, how long should it wait in the pending deletion state? | `string` | `"30"` | no |
| <a name="input_log_retention_in_days"></a> [log\_retention\_in\_days](#input\_log\_retention\_in\_days) | The retention period in days for the Cloudwatch Logs events to be retained, default of 0 is indefinite | `number` | `0` | no |
| <a name="input_parent_acct_environment"></a> [parent\_acct\_environment](#input\_parent\_acct\_environment) | Name of the environment responsible for the acct resources used, affects things like DNS zone. Useful for named dev environments | `string` | `"main"` | no |
| <a name="input_project"></a> [project](#input\_project) | The name of the tfscaffold project | `string` | n/a | yes |
| <a name="input_region"></a> [region](#input\_region) | The AWS Region | `string` | n/a | yes |
## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_backend_api"></a> [backend\_api](#module\_backend\_api) | ../../modules/backend-api | n/a |
| <a name="module_cognito_triggers"></a> [cognito\_triggers](#module\_cognito\_triggers) | ../../modules/cognito-triggers | n/a |
| <a name="module_eventpub"></a> [eventpub](#module\_eventpub) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/eventpub | v2.0.19 |
## Outputs

| Name | Description |
|------|-------------|
| <a name="output_api_base_url"></a> [api\_base\_url](#output\_api\_base\_url) | n/a |
| <a name="output_client_ssm_path_prefix"></a> [client\_ssm\_path\_prefix](#output\_client\_ssm\_path\_prefix) | n/a |
| <a name="output_cognito_user_pool_client_id"></a> [cognito\_user\_pool\_client\_id](#output\_cognito\_user\_pool\_client\_id) | n/a |
| <a name="output_cognito_user_pool_id"></a> [cognito\_user\_pool\_id](#output\_cognito\_user\_pool\_id) | n/a |
| <a name="output_deployment"></a> [deployment](#output\_deployment) | Deployment details used for post-deployment scripts |
| <a name="output_download_bucket_name"></a> [download\_bucket\_name](#output\_download\_bucket\_name) | n/a |
| <a name="output_event_cache_bucket_name"></a> [event\_cache\_bucket\_name](#output\_event\_cache\_bucket\_name) | n/a |
| <a name="output_internal_bucket_name"></a> [internal\_bucket\_name](#output\_internal\_bucket\_name) | n/a |
| <a name="output_quarantine_bucket_name"></a> [quarantine\_bucket\_name](#output\_quarantine\_bucket\_name) | n/a |
| <a name="output_request_proof_queue_url"></a> [request\_proof\_queue\_url](#output\_request\_proof\_queue\_url) | n/a |
| <a name="output_routing_config_table_name"></a> [routing\_config\_table\_name](#output\_routing\_config\_table\_name) | n/a |
| <a name="output_sftp_environment"></a> [sftp\_environment](#output\_sftp\_environment) | n/a |
| <a name="output_sftp_mock_credential_path"></a> [sftp\_mock\_credential\_path](#output\_sftp\_mock\_credential\_path) | n/a |
| <a name="output_sftp_poll_lambda_name"></a> [sftp\_poll\_lambda\_name](#output\_sftp\_poll\_lambda\_name) | n/a |
| <a name="output_templates_table_name"></a> [templates\_table\_name](#output\_templates\_table\_name) | n/a |
| <a name="output_test_email_bucket_name"></a> [test\_email\_bucket\_name](#output\_test\_email\_bucket\_name) | n/a |
| <a name="output_test_email_bucket_prefix"></a> [test\_email\_bucket\_prefix](#output\_test\_email\_bucket\_prefix) | n/a |
<!-- vale on -->
<!-- markdownlint-enable -->
<!-- END_TF_DOCS -->
