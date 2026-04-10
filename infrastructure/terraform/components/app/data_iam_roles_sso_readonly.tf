data "aws_iam_roles" "sso_readonly" {
  name_regex  = "AWSReservedSSO_${var.project}-readonly_.*"
  path_prefix = "/aws-reserved/sso.amazonaws.com/${var.region}/"
}
