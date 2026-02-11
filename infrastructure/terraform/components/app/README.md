<!-- BEGIN_TF_DOCS -->
<!-- markdownlint-disable -->
<!-- vale off -->

## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.9.0 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | ~> 6.30 |
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_AMPLIFY_BASIC_AUTH_SECRET"></a> [AMPLIFY\_BASIC\_AUTH\_SECRET](#input\_AMPLIFY\_BASIC\_AUTH\_SECRET) | Secret key/password to use for Amplify Basic Auth - This is intended to be read from CI variables and not committed to any codebase | `string` | `"unset"` | no |
| <a name="input_CSRF_SECRET"></a> [CSRF\_SECRET](#input\_CSRF\_SECRET) | Secure cryptographic key to be used for generating CSRF tokens - This is intended to be read from CI variables and not committed to any codebase | `string` | `"value"` | no |
| <a name="input_aws_account_id"></a> [aws\_account\_id](#input\_aws\_account\_id) | The AWS Account ID (numeric) | `string` | n/a | yes |
| <a name="input_aws_principal_org_id"></a> [aws\_principal\_org\_id](#input\_aws\_principal\_org\_id) | The AWS Org ID (numeric) | `string` | n/a | yes |
| <a name="input_backup_report_recipient"></a> [backup\_report\_recipient](#input\_backup\_report\_recipient) | Primary recipient of the Backup reports | `string` | `""` | no |
| <a name="input_backup_schedule_cron"></a> [backup\_schedule\_cron](#input\_backup\_schedule\_cron) | Defines the backup schedule in AWS Cron Expression format | `string` | `"cron(0 2 * * ? *)"` | no |
| <a name="input_branch_name"></a> [branch\_name](#input\_branch\_name) | The branch name to deploy | `string` | `"main"` | no |
| <a name="input_cognito_user_pool_additional_callback_urls"></a> [cognito\_user\_pool\_additional\_callback\_urls](#input\_cognito\_user\_pool\_additional\_callback\_urls) | A list of additional callback\_urls for the cognito user pool | `list(string)` | `[]` | no |
| <a name="input_commit_id"></a> [commit\_id](#input\_commit\_id) | The commit to deploy. Must be in the tree for branch\_name | `string` | `"HEAD"` | no |
| <a name="input_component"></a> [component](#input\_component) | The variable encapsulating the name of this component | `string` | `"app"` | no |
| <a name="input_container_lambda_ecr_repo"></a> [container\_lambda\_ecr\_repo](#input\_container\_lambda\_ecr\_repo) | ECR repository name for container-based lambda images | `string` | `"nhs-notify-main-acct"` | no |
| <a name="input_control_plane_bus_arn"></a> [control\_plane\_bus\_arn](#input\_control\_plane\_bus\_arn) | Data plane event bus arn | `string` | n/a | yes |
| <a name="input_data_plane_bus_arn"></a> [data\_plane\_bus\_arn](#input\_data\_plane\_bus\_arn) | Data plane event bus arn | `string` | n/a | yes |
| <a name="input_default_tags"></a> [default\_tags](#input\_default\_tags) | A map of default tags to apply to all taggable resources within the component | `map(string)` | `{}` | no |
| <a name="input_destination_vault_arn"></a> [destination\_vault\_arn](#input\_destination\_vault\_arn) | ARN of the backup vault in the destination account, if this environment should be backed up | `string` | `null` | no |
| <a name="input_enable_amplify_basic_auth"></a> [enable\_amplify\_basic\_auth](#input\_enable\_amplify\_basic\_auth) | Enable a basic set of credentials in the form of a dynamically generated username and password for the amplify app branches. Not intended for production use | `bool` | `true` | no |
| <a name="input_enable_amplify_branch_auto_build"></a> [enable\_amplify\_branch\_auto\_build](#input\_enable\_amplify\_branch\_auto\_build) | Enable automatic building of branches | `bool` | `false` | no |
| <a name="input_enable_api_data_trace"></a> [enable\_api\_data\_trace](#input\_enable\_api\_data\_trace) | Enable API Gateway data trace logging | `bool` | `false` | no |
| <a name="input_enable_cognito_built_in_idp"></a> [enable\_cognito\_built\_in\_idp](#input\_enable\_cognito\_built\_in\_idp) | Enable the use of Cognito as an IDP; CIS2 is preferred | `bool` | `false` | no |
| <a name="input_enable_event_caching"></a> [enable\_event\_caching](#input\_enable\_event\_caching) | Enable caching of events to an S3 bucket | `bool` | `true` | no |
| <a name="input_environment"></a> [environment](#input\_environment) | The name of the tfscaffold environment | `string` | n/a | yes |
| <a name="input_event_delivery_logging"></a> [event\_delivery\_logging](#input\_event\_delivery\_logging) | Enable SNS Event Delivery logging | `bool` | `true` | no |
| <a name="input_event_delivery_logging_success_sample_percentage"></a> [event\_delivery\_logging\_success\_sample\_percentage](#input\_event\_delivery\_logging\_success\_sample\_percentage) | Enable caching of events to an S3 bucket | `number` | `0` | no |
| <a name="input_external_email_domain"></a> [external\_email\_domain](#input\_external\_email\_domain) | Externally managed domain used to create an SES identity for sending emails from. Validation DNS records will need to be manually configured in the DNS provider. | `string` | `null` | no |
| <a name="input_group"></a> [group](#input\_group) | The group variables are being inherited from (often synonymous with account short-name) | `string` | n/a | yes |
| <a name="input_image_tag_suffix"></a> [image\_tag\_suffix](#input\_image\_tag\_suffix) | The short SHA or Release Tag to append to the container lambda image tag | `string` | n/a | yes |
| <a name="input_kms_deletion_window"></a> [kms\_deletion\_window](#input\_kms\_deletion\_window) | When a kms key is deleted, how long should it wait in the pending deletion state? | `string` | `"30"` | no |
| <a name="input_letter_suppliers"></a> [letter\_suppliers](#input\_letter\_suppliers) | Letter suppliers enabled in the environment | <pre>map(object({<br/>    email_addresses  = list(string)<br/>    enable_polling   = bool<br/>    default_supplier = optional(bool)<br/>  }))</pre> | `{}` | no |
| <a name="input_log_retention_in_days"></a> [log\_retention\_in\_days](#input\_log\_retention\_in\_days) | The retention period in days for the Cloudwatch Logs events to be retained, default of 0 is indefinite | `number` | `0` | no |
| <a name="input_observability_account_id"></a> [observability\_account\_id](#input\_observability\_account\_id) | The Observability Account ID that needs access | `string` | n/a | yes |
| <a name="input_parent_acct_environment"></a> [parent\_acct\_environment](#input\_parent\_acct\_environment) | Name of the environment responsible for the acct resources used, affects things like DNS zone. Useful for named dev environments | `string` | `"main"` | no |
| <a name="input_project"></a> [project](#input\_project) | The name of the tfscaffold project | `string` | n/a | yes |
| <a name="input_region"></a> [region](#input\_region) | The AWS Region | `string` | n/a | yes |
| <a name="input_retention_period"></a> [retention\_period](#input\_retention\_period) | Backup Vault Retention Period | `number` | `31` | no |
| <a name="input_url_prefix"></a> [url\_prefix](#input\_url\_prefix) | The url prefix to use for the deployed branch | `string` | `"main"` | no |
## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_amplify_branch"></a> [amplify\_branch](#module\_amplify\_branch) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-amp_branch.zip | n/a |
| <a name="module_backend_api"></a> [backend\_api](#module\_backend\_api) | ../../modules/backend-api | n/a |
| <a name="module_download_authorizer_lambda"></a> [download\_authorizer\_lambda](#module\_download\_authorizer\_lambda) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.29/terraform-lambda.zip | n/a |
| <a name="module_eventpub"></a> [eventpub](#module\_eventpub) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/eventpub | v2.0.28 |
| <a name="module_kms"></a> [kms](#module\_kms) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-kms.zip | n/a |
| <a name="module_kms_us_east_1"></a> [kms\_us\_east\_1](#module\_kms\_us\_east\_1) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-kms.zip | n/a |
| <a name="module_letter_preview_renderer_lambda"></a> [letter\_preview\_renderer\_lambda](#module\_letter\_preview\_renderer\_lambda) | git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda | feature/CCM-14149_Support_Container_Based_Lambdas |
| <a name="module_nhse_backup_vault"></a> [nhse\_backup\_vault](#module\_nhse\_backup\_vault) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.25/terraform-aws-backup-source.zip | n/a |
| <a name="module_s3bucket_cf_logs"></a> [s3bucket\_cf\_logs](#module\_s3bucket\_cf\_logs) | https://github.com/NHSDigital/nhs-notify-shared-modules/releases/download/v2.0.20/terraform-s3bucket.zip | n/a |
| <a name="module_ses"></a> [ses](#module\_ses) | ../../modules/ses | n/a |
## Outputs

| Name | Description |
|------|-------------|
| <a name="output_amplify"></a> [amplify](#output\_amplify) | n/a |
| <a name="output_deployment"></a> [deployment](#output\_deployment) | Deployment details used for post-deployment scripts |
<!-- vale on -->
<!-- markdownlint-enable -->
<!-- END_TF_DOCS -->
