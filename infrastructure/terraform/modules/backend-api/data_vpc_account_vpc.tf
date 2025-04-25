data "aws_vpc" "account_vpc" {
  tags = {
    Component = "acct"
  }
}

data "aws_subnets" "account_vpc_private_subnets" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.account_vpc.id]
  }

  tags = {
    Tier = "Private"
  }
}

data "aws_security_group" "account_vpc_sg_allow_sftp_egress" {
  vpc_id = data.aws_vpc.account_vpc.id

  tags = {
    Name = "${data.aws_vpc.account_vpc.tags["Project"]}-${data.aws_vpc.account_vpc.tags["Environment"]}-acct-vpc-sftp-egress"
  }
}
