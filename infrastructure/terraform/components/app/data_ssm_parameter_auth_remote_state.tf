data "aws_ssm_parameter" "auth_remote_state" {
  name = "/${var.project}/${var.environment}/${var.component}/auth_remote_state"
}

locals {
    auth_remote_state = jsondecode(data.aws_ssm_parameter.auth_remote_state.value)
}
