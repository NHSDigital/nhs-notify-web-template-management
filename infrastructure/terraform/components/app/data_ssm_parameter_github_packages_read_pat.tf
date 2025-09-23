data "aws_ssm_parameter" "github_packages_read_pat" {
  name = local.acct.github_packages_read_pat_ssm_param_name
}
