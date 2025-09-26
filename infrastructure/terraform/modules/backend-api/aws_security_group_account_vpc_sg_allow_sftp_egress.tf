resource "aws_security_group" "account_vpc_sg_allow_sftp_egress" {
  name        = "${data.aws_vpc.account_vpc.tags["Project"]}-${data.aws_vpc.account_vpc.tags["Environment"]}-acct-sftp-egress"
  description = "Security group to allow SFTP egress"
  vpc_id      = data.aws_vpc.account_vpc.id
}

resource "aws_security_group_rule" "allow_sftp_egress" {
  type              = "egress"
  description       = "Allow outbound SFTP"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.account_vpc_sg_allow_sftp_egress.id
}
