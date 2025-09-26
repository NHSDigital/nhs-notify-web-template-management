terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
  }

  required_version = ">= 1.10.1"
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
