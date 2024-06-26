###
# Default provider, used for all deployments to eu-west-2
# If no provider name is supplied for a resource then it uses this one
###
provider "aws" {
  region = var.region

  default_tags {
    tags = local.deployment_default_tags
  }
}
