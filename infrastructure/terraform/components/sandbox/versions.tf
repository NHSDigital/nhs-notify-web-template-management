terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
      configuration_aliases = [aws.us-east-1]
    }
  }

  required_version = ">= 1.9.0"
}
