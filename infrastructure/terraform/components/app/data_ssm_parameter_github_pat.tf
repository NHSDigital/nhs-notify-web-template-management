data "aws_ssm_parameter" "github_pat_ssm_param_name" {
  name = local.acct.additional_ssm_parameters["client-config_github_pat"].name
}
