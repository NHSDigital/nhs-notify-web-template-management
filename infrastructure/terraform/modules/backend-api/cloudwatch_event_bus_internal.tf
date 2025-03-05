resource "aws_cloudwatch_event_bus" "internal" {
  name        = "${local.csi}-templates"
  description = "Internal events for NHS Notify Templates"
}
