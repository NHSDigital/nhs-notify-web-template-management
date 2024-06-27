# The default AWS provider in the default region
provider "aws" {
  region = var.region

  allowed_account_ids = [
    var.aws_account_id,
  ]
}
