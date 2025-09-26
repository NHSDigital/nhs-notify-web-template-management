locals {
  component = "tmsbx"

  terraform_state_bucket = format(
    "%s-tfscaffold-%s-%s",
    var.project,
    var.aws_account_id,
    var.region,
  )

  csi = replace(
    format(
      "%s-%s-%s",
      var.project,
      var.environment,
      local.component,
    ),
    "_",
    "",
  )

  default_tags = merge(
    var.default_tags,
    {
      Project     = var.project
      Environment = var.environment
      Component   = local.component
      Group       = var.group
      Name        = local.csi
    },
  )

  acct_global_csi = replace(
    format(
      "%s-%s-%s-%s-acct",
      var.project,
      var.aws_account_id,
      var.region,
      var.parent_acct_environment,
    ),
    "_",
    "",
  )
}
