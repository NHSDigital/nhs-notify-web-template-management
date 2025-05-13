provider "aws" {
  region = var.region

  allowed_account_ids = [
    var.aws_account_id,
  ]

  default_tags {
    tags = local.default_tags
  }
}

provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"

  default_tags {
    tags = local.default_tags
  }

  allowed_account_ids = [
    var.aws_account_id,
  ]
}

provider "aws" {
  alias  = "obs"
  region = var.region

  assume_role {
    role_arn     = "arn:aws:iam::${var.observability_account_id}:role/${local.bootstrap.iam_github_deploy_role["name"]}"
    session_name = local.csi
  }

  default_tags {
    tags = local.default_tags
  }
}
