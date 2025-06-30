<!-- BEGIN_TF_DOCS -->
<!-- markdownlint-disable -->
<!-- vale off -->

## Requirements

No requirements.
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_aws_account_id"></a> [aws\_account\_id](#input\_aws\_account\_id) | The AWS Account ID (numeric) | `string` | n/a | yes |
| <a name="input_component"></a> [component](#input\_component) | The name of the tfscaffold component | `string` | n/a | yes |
| <a name="input_environment"></a> [environment](#input\_environment) | The name of the tfscaffold environment | `string` | n/a | yes |
| <a name="input_external_email_domain"></a> [external\_email\_domain](#input\_external\_email\_domain) | External email domain | `string` | `null` | no |
| <a name="input_kms_key_arn"></a> [kms\_key\_arn](#input\_kms\_key\_arn) | KMS key ARN | `string` | n/a | yes |
| <a name="input_project"></a> [project](#input\_project) | The name of the tfscaffold project | `string` | n/a | yes |
| <a name="input_region"></a> [region](#input\_region) | The AWS Region | `string` | n/a | yes |
| <a name="input_root_domain_name"></a> [root\_domain\_name](#input\_root\_domain\_name) | Root domain name | `string` | n/a | yes |
| <a name="input_use_sftp_letter_supplier_mock"></a> [use\_sftp\_letter\_supplier\_mock](#input\_use\_sftp\_letter\_supplier\_mock) | Flag indicating whether mock letter supplier is enabled | `bool` | n/a | yes |
| <a name="input_zone_id"></a> [zone\_id](#input\_zone\_id) | Route53 zone ID | `string` | n/a | yes |
## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_s3bucket_ses"></a> [s3bucket\_ses](#module\_s3bucket\_ses) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/s3bucket | v2.0.4 |
## Outputs

| Name | Description |
|------|-------------|
| <a name="output_domain"></a> [domain](#output\_domain) | n/a |
<!-- vale on -->
<!-- markdownlint-enable -->
<!-- END_TF_DOCS -->
