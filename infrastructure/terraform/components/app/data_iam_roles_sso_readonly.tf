data "aws_iam_roles" "sso_readonly" {
  name_regex  = "AWSReservedSSO_permission_set_name_${var.project}_readonly_.*"
  path_prefix = "/aws-reserved/sso.amazonaws.com/"
}
