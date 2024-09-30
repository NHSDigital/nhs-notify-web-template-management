data "aws_ssm_parameter" "github_pat_ssm_param_name" {
  name = local.acct.github_pat_ssm_param_name
}

resource "aws_ssm_parameter" "user_pool_id" {
  name        = "/${local.csi}/user_pool_id"
  description = "Cognito User Pool ID"
  type        = "SecureString"
  value       = "UNSET"

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "user_pool_client_id" {
  name        = "/${local.csi}/user_pool_client_id"
  description = "Cognito User Pool Client ID"
  type        = "SecureString"
  value       = "UNSET"

  lifecycle {
    ignore_changes = [value]
  }
}
