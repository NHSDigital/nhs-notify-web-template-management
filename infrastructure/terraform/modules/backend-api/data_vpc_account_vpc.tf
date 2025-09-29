data "aws_vpc" "account_vpc" {
  id = var.vpc_id
}

data "aws_subnets" "account_vpc_private_subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.account_vpc.id]
  }

  tags = {
    Subnet = "Private"
  }
}
