resource "aws_security_group" "allow_sftp_egress" {
  name        = "${local.csi}-sftp-egress"
  vpc_id      = module.vpc.vpc_id
  description = "Security group for allowing outbound traffic to SFTP"

  tags = {
    Name = "${local.csi}-sftp-egress"
  }
}
