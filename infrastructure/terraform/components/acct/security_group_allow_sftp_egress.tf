resource "aws_security_group" "allow_sftp_egress" {
  name        = "${local.csi}-sftp-egress"
  vpc_id      = module.vpc.vpc_id
  description = "Security group for allowing outbound traffic to SFTP"

  tags = {
    Name = "${local.csi}-sftp-egress"
  }
}

#tfsec:ignore:aws-ec2-no-public-egress-sgr
resource "aws_security_group_rule" "allow_sftp_egress_ssh" {
  description       = "Allow SFTP egress within VPC on port 22"
  type              = "egress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.allow_sftp_egress.id
}

#tfsec:ignore:aws-ec2-no-public-egress-sgr
resource "aws_security_group_rule" "allow_sftp_egress_https" {
  description       = "Allow SFTP egress within VPC on port 443"
  type              = "egress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.allow_sftp_egress.id
}
