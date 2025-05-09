provider "aws" {
  region = var.region

  allowed_account_ids = [
    var.aws_account_id,
  ]

  default_tags {
    tags = local.default_tags
  }
}

# Add the us-east-1 provider for CloudFront
provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"

  allowed_account_ids = [
    var.aws_account_id,
  ]

  default_tags {
    tags = local.default_tags
  }
}
