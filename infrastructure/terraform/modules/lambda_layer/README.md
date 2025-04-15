<!-- BEGIN_TF_DOCS -->
<!-- markdownlint-disable -->
<!-- vale off -->

## Requirements

No requirements.
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_description"></a> [description](#input\_description) | Description of what your Lambda Layer does | `string` | n/a | yes |
| <a name="input_layer_dir"></a> [layer\_dir](#input\_layer\_dir) | Path to the root directory of the layer code | `string` | n/a | yes |
| <a name="input_name"></a> [name](#input\_name) | Unique name for your Lambda Layer | `string` | n/a | yes |
| <a name="input_nodejs_runtime_version"></a> [nodejs\_runtime\_version](#input\_nodejs\_runtime\_version) | Node.js runtime version | `string` | `"20"` | no |
| <a name="input_output_dir"></a> [output\_dir](#input\_output\_dir) | Name of the output directory (relative to layer\_dir) | `string` | `"dist"` | no |
| <a name="input_source_dir"></a> [source\_dir](#input\_source\_dir) | Name of the source code directory (relative to layer\_dir) | `string` | n/a | yes |
## Modules

No modules.
## Outputs

| Name | Description |
|------|-------------|
| <a name="output_layer_arn"></a> [layer\_arn](#output\_layer\_arn) | n/a |
<!-- vale on -->
<!-- markdownlint-enable -->
<!-- END_TF_DOCS -->
