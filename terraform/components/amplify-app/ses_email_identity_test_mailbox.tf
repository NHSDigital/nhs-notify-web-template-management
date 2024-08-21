resource "aws_ses_email_identity" "test_mailbox" {
  count = var.deploy_ses_email_identity ? 1 : 0

  email = "england.test.cm@nhs.net"
}
