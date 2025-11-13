resource "aws_ssm_parameter" "test_cis2_client_id" {
  name = format(
    "/%s/test/cis2-int/notify-client-id",
    local.csi,
  )
  description = "Test user client ID"
  type        = "String"

  value = "placeholder"

  lifecycle {
    ignore_changes = [value]
  }
}
