resource "aws_ssm_parameter" "contact_details_otp_secret" {
  name        = "/${local.csi}/contact-details-otp-secret"
  description = "Server secret for hashing OTPs"
  type        = "SecureString"
  value       = random_bytes.contact_details_otp_secret.base64
  key_id      = var.kms_key_arn

  lifecycle {
    ignore_changes = [value]
  }
}

resource "random_bytes" "contact_details_otp_secret" {
  length = 64
}
