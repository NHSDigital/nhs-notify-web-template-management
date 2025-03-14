<!-- BEGIN_TF_DOCS -->
<!-- markdownlint-disable -->
<!-- vale off -->

## Requirements

No requirements.
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_aws_account_id"></a> [aws\_account\_id](#input\_aws\_account\_id) | The AWS Account ID (numeric) | `string` | n/a | yes |
| <a name="input_cognito_config"></a> [cognito\_config](#input\_cognito\_config) | Cognito config | <pre>object({<br/>    USER_POOL_ID : string,<br/>    USER_POOL_CLIENT_ID : string<br/>  })</pre> | n/a | yes |
| <a name="input_component"></a> [component](#input\_component) | The variable encapsulating the name of this component | `string` | `"api"` | no |
| <a name="input_csi"></a> [csi](#input\_csi) | CSI from the parent component | `string` | n/a | yes |
| <a name="input_dynamodb_kms_key_arn"></a> [dynamodb\_kms\_key\_arn](#input\_dynamodb\_kms\_key\_arn) | KMS Key ARN for encrypting DynamoDB data. If not given, a key will be created. | `string` | `""` | no |
| <a name="input_enable_backup"></a> [enable\_backup](#input\_enable\_backup) | Enable Backups for the DynamoDB table? | `bool` | `true` | no |
| <a name="input_enable_letters"></a> [enable\_letters](#input\_enable\_letters) | Enable letters feature flag | `bool` | n/a | yes |
| <a name="input_environment"></a> [environment](#input\_environment) | The name of the tfscaffold environment | `string` | n/a | yes |
| <a name="input_group"></a> [group](#input\_group) | The group variables are being inherited from (often synonmous with account short-name) | `string` | n/a | yes |
| <a name="input_kms_key_arn"></a> [kms\_key\_arn](#input\_kms\_key\_arn) | KMS Key ARN | `string` | n/a | yes |
| <a name="input_log_retention_in_days"></a> [log\_retention\_in\_days](#input\_log\_retention\_in\_days) | The retention period in days for the Cloudwatch Logs events to be retained, default of 0 is indefinite | `number` | `0` | no |
| <a name="input_project"></a> [project](#input\_project) | The name of the tfscaffold project | `string` | n/a | yes |
| <a name="input_region"></a> [region](#input\_region) | The AWS Region | `string` | n/a | yes |
## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_authorizer_build"></a> [authorizer\_build](#module\_authorizer\_build) | ../typescript-build-zip | n/a |
| <a name="module_authorizer_lambda"></a> [authorizer\_lambda](#module\_authorizer\_lambda) | ../lambda-function | n/a |
| <a name="module_build_template_client"></a> [build\_template\_client](#module\_build\_template\_client) | ../typescript-build-zip | n/a |
| <a name="module_build_template_lambda"></a> [build\_template\_lambda](#module\_build\_template\_lambda) | ../typescript-build-zip | n/a |
| <a name="module_create_template_lambda"></a> [create\_template\_lambda](#module\_create\_template\_lambda) | ../lambda-function | n/a |
| <a name="module_get_template_lambda"></a> [get\_template\_lambda](#module\_get\_template\_lambda) | ../lambda-function | n/a |
| <a name="module_list_template_lambda"></a> [list\_template\_lambda](#module\_list\_template\_lambda) | ../lambda-function | n/a |
| <a name="module_object_tagging_enrichment_quarantine"></a> [object\_tagging\_enrichment\_quarantine](#module\_object\_tagging\_enrichment\_quarantine) | ../s3-object-tagging-enrichment | n/a |
| <a name="module_s3bucket_internal"></a> [s3bucket\_internal](#module\_s3bucket\_internal) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/s3bucket | v1.0.8 |
| <a name="module_s3bucket_quarantine"></a> [s3bucket\_quarantine](#module\_s3bucket\_quarantine) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/s3bucket | v1.0.8 |
| <a name="module_update_template_lambda"></a> [update\_template\_lambda](#module\_update\_template\_lambda) | ../lambda-function | n/a |
## Outputs

| Name | Description |
|------|-------------|
| <a name="output_api_base_url"></a> [api\_base\_url](#output\_api\_base\_url) | n/a |
| <a name="output_templates_table_name"></a> [templates\_table\_name](#output\_templates\_table\_name) | n/a |
<!-- vale on -->
<!-- markdownlint-enable -->
<!-- END_TF_DOCS -->
