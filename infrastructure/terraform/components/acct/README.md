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
| <a name="input_budget_amount"></a> [budget\_amount](#input\_budget\_amount) | The budget amount in USD for the account | `number` | `500` | no |
| <a name="input_component"></a> [component](#input\_component) | The variable encapsulating the name of this component | `string` | `"acct"` | no |
| <a name="input_cost_alarm_recipients"></a> [cost\_alarm\_recipients](#input\_cost\_alarm\_recipients) | A list of email addresses to receive alarm notifications | `list(string)` | `[]` | no |
| <a name="input_cost_anomaly_threshold"></a> [cost\_anomaly\_threshold](#input\_cost\_anomaly\_threshold) | The threshold percentage for cost anomaly detection | `number` | `10` | no |
| <a name="input_default_tags"></a> [default\_tags](#input\_default\_tags) | A map of default tags to apply to all taggable resources within the component | `map(string)` | `{}` | no |
| <a name="input_enable_env_destroy_event_rule"></a> [enable\_env\_destroy\_event\_rule](#input\_enable\_env\_destroy\_event\_rule) | Toggles the creation of the CloudWatch Event Rule for environment destruction failures | `bool` | `false` | no |
| <a name="input_environment"></a> [environment](#input\_environment) | The name of the tfscaffold environment | `string` | n/a | yes |
| <a name="input_group"></a> [group](#input\_group) | The group variables are being inherited from (often synonmous with account short-name) | `string` | n/a | yes |
| <a name="input_initial_cli_secrets_provision_override"></a> [initial\_cli\_secrets\_provision\_override](#input\_initial\_cli\_secrets\_provision\_override) | A map of default value to intialise SSM secret values with. Only useful for initial setup of the account due to lifecycle rules. | `map(string)` | `{}` | no |
| <a name="input_kms_deletion_window"></a> [kms\_deletion\_window](#input\_kms\_deletion\_window) | When a kms key is deleted, how long should it wait in the pending deletion state? | `string` | `"30"` | no |
| <a name="input_letter_suppliers"></a> [letter\_suppliers](#input\_letter\_suppliers) | Letter suppliers enabled in the account (across all environments) | <pre>map(object({<br/>    enable_polling   = bool<br/>    default_supplier = optional(bool)<br/>  }))</pre> | `{}` | no |
| <a name="input_log_retention_in_days"></a> [log\_retention\_in\_days](#input\_log\_retention\_in\_days) | The retention period in days for the Cloudwatch Logs events to be retained, default of 0 is indefinite | `number` | `0` | no |
| <a name="input_oam_sink_id"></a> [oam\_sink\_id](#input\_oam\_sink\_id) | The ID of the Cloudwatch OAM sink in the appropriate observability account. | `string` | `""` | no |
| <a name="input_observability_account_id"></a> [observability\_account\_id](#input\_observability\_account\_id) | The Observability Account ID that needs access | `string` | n/a | yes |
| <a name="input_project"></a> [project](#input\_project) | The name of the tfscaffold project | `string` | n/a | yes |
| <a name="input_region"></a> [region](#input\_region) | The AWS Region | `string` | n/a | yes |
| <a name="input_root_domain_name"></a> [root\_domain\_name](#input\_root\_domain\_name) | The service's root DNS root nameespace, like nonprod.nhsnotify.national.nhs.uk | `string` | `"nonprod.nhsnotify.national.nhs.uk"` | no |
| <a name="input_support_sandbox_environments"></a> [support\_sandbox\_environments](#input\_support\_sandbox\_environments) | Does this account support dev sandbox environments? | `bool` | `false` | no |
| <a name="input_vpc_cidr"></a> [vpc\_cidr](#input\_vpc\_cidr) | n/a | `string` | `"10.0.0.0/16"` | no |
| <a name="input_vpc_subnet_cidr_bits"></a> [vpc\_subnet\_cidr\_bits](#input\_vpc\_subnet\_cidr\_bits) | Number of additional bits to use for subnetting the VPC CIDR block. The bits are evently distributed | <pre>object({<br/>    public  = number<br/>    private = number<br/>  })</pre> | <pre>{<br/>  "private": 3,<br/>  "public": 12<br/>}</pre> | no |
## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_kms_ecr"></a> [kms\_ecr](#module\_kms\_ecr) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-kms.zip | n/a |
| <a name="module_kms_sandbox"></a> [kms\_sandbox](#module\_kms\_sandbox) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-kms.zip | n/a |
| <a name="module_obs_datasource"></a> [obs\_datasource](#module\_obs\_datasource) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-obs-datasource.zip | n/a |
| <a name="module_s3bucket_access_logs"></a> [s3bucket\_access\_logs](#module\_s3bucket\_access\_logs) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-s3bucket.zip | n/a |
| <a name="module_s3bucket_artefacts"></a> [s3bucket\_artefacts](#module\_s3bucket\_artefacts) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-s3bucket.zip | n/a |
| <a name="module_s3bucket_artefacts_us_east_1"></a> [s3bucket\_artefacts\_us\_east\_1](#module\_s3bucket\_artefacts\_us\_east\_1) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-s3bucket.zip | n/a |
| <a name="module_s3bucket_backup_reports"></a> [s3bucket\_backup\_reports](#module\_s3bucket\_backup\_reports) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-s3bucket.zip | n/a |
| <a name="module_s3bucket_data_migration_backups"></a> [s3bucket\_data\_migration\_backups](#module\_s3bucket\_data\_migration\_backups) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-s3bucket.zip | n/a |
| <a name="module_sandbox_ses"></a> [sandbox\_ses](#module\_sandbox\_ses) | ../../modules/ses | n/a |
| <a name="module_ses_testing"></a> [ses\_testing](#module\_ses\_testing) | ../../modules/acct-ses-testing | n/a |
| <a name="module_vpc"></a> [vpc](#module\_vpc) | terraform-aws-modules/vpc/aws | 5.19.0 |
## Outputs

| Name | Description |
|------|-------------|
| <a name="output_dns_zone"></a> [dns\_zone](#output\_dns\_zone) | n/a |
| <a name="output_github_pat_ssm_param_name"></a> [github\_pat\_ssm\_param\_name](#output\_github\_pat\_ssm\_param\_name) | n/a |
| <a name="output_log_subscription_role_arn"></a> [log\_subscription\_role\_arn](#output\_log\_subscription\_role\_arn) | n/a |
| <a name="output_s3_buckets"></a> [s3\_buckets](#output\_s3\_buckets) | n/a |
| <a name="output_ses_testing_config"></a> [ses\_testing\_config](#output\_ses\_testing\_config) | n/a |
| <a name="output_vpc_nat_ips"></a> [vpc\_nat\_ips](#output\_vpc\_nat\_ips) | n/a |
| <a name="output_vpc_subnets"></a> [vpc\_subnets](#output\_vpc\_subnets) | n/a |
<!-- vale on -->
<!-- markdownlint-enable -->
<!-- END_TF_DOCS -->
