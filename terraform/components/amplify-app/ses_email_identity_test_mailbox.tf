resource "aws_ses_email_identity" "test_mailbox" {
  count = var.deploy_ses_email_identity == "true" ? 1 : 0
  email = "england.test.cm@nhs.net"
}
