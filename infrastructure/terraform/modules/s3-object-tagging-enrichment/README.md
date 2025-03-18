<!-- BEGIN_TF_DOCS -->
<!-- markdownlint-disable -->
<!-- vale off -->

## Requirements

No requirements.
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_aws_account_id"></a> [aws\_account\_id](#input\_aws\_account\_id) | The AWS Account ID (numeric) | `string` | n/a | yes |
| <a name="input_component"></a> [component](#input\_component) | The variable encapsulating the name of this component | `string` | n/a | yes |
| <a name="input_environment"></a> [environment](#input\_environment) | The name of the tfscaffold environment | `string` | n/a | yes |
| <a name="input_group"></a> [group](#input\_group) | The group variables are being inherited from (often synonymous with account short-name) | `string` | n/a | yes |
| <a name="input_id"></a> [id](#input\_id) | ID for the module instance | `string` | n/a | yes |
| <a name="input_kms_key_arn"></a> [kms\_key\_arn](#input\_kms\_key\_arn) | ARN of KMS Key used for encrypting application data | `string` | n/a | yes |
| <a name="input_log_retention_in_days"></a> [log\_retention\_in\_days](#input\_log\_retention\_in\_days) | The retention period in days for the Cloudwatch Logs events to be retained, default of 0 is indefinite | `number` | `0` | no |
| <a name="input_output_event_source"></a> [output\_event\_source](#input\_output\_event\_source) | the value of the 'source' field on the emitted events | `string` | n/a | yes |
| <a name="input_project"></a> [project](#input\_project) | The name of the tfscaffold project | `string` | n/a | yes |
| <a name="input_region"></a> [region](#input\_region) | The AWS Region | `string` | n/a | yes |
| <a name="input_source_bucket"></a> [source\_bucket](#input\_source\_bucket) | Source bucket details | <pre>object({<br/>    arn : string<br/>    name : string<br/>  })</pre> | n/a | yes |
| <a name="input_source_csi"></a> [source\_csi](#input\_source\_csi) | CSI from the parent component | `string` | n/a | yes |
| <a name="input_target_event_bus_arn"></a> [target\_event\_bus\_arn](#input\_target\_event\_bus\_arn) | ARN of the event bus to send tag-enrichment events to | `string` | n/a | yes |
## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_build_get_s3_object_tags_lambda"></a> [build\_get\_s3\_object\_tags\_lambda](#module\_build\_get\_s3\_object\_tags\_lambda) | ../typescript-build-zip | n/a |
| <a name="module_lambda_get_s3_object_tags"></a> [lambda\_get\_s3\_object\_tags](#module\_lambda\_get\_s3\_object\_tags) | ../lambda-function | n/a |
| <a name="module_sqs_tags_added"></a> [sqs\_tags\_added](#module\_sqs\_tags\_added) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/sqs | v1.0.8 |
## Outputs

No outputs.
<!-- vale on -->
<!-- markdownlint-enable -->
<!-- END_TF_DOCS -->
