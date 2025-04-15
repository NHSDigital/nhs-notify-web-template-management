<!-- BEGIN_TF_DOCS -->
<!-- markdownlint-disable -->
<!-- vale off -->

## Requirements

No requirements.
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_description"></a> [description](#input\_description) | Description of what your Lambda Layer does | `string` | n/a | yes |
| <a name="input_name"></a> [name](#input\_name) | Unique name for your Lambda Layer | `string` | n/a | yes |
| <a name="input_nodejs_runtime_version"></a> [nodejs\_runtime\_version](#input\_nodejs\_runtime\_version) | Node.js runtime version | `string` | `"20"` | no |
| <a name="input_output_dir"></a> [output\_dir](#input\_output\_dir) | Name of the output directory (relative to source\_code\_dir) | `string` | `"dist"` | no |
| <a name="input_source_code_dir"></a> [source\_code\_dir](#input\_source\_code\_dir) | Path to the root directory of the project source code | `string` | n/a | yes |
## Modules

No modules.
## Outputs

| Name | Description |
|------|-------------|
| <a name="output_layer_arn"></a> [layer\_arn](#output\_layer\_arn) | n/a |
<!-- vale on -->
<!-- markdownlint-enable -->
<!-- END_TF_DOCS -->
