resource "aws_cloudwatch_log_group" "pipe_template_table_events" {
  name              = "/aws/vendedlogs/pipes/${local.csi}-template-table-events"
  kms_key_id        = var.kms_key_arn
  retention_in_days = var.log_retention_in_days
}
