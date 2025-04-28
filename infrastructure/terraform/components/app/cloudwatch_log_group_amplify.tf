resource "aws_cloudwatch_log_group" "amplify" {
  name              = "/aws/amplify/${aws_amplify_app.main.id}"
  retention_in_days = var.log_retention_in_days
}

resource "aws_cloudwatch_log_subscription_filter" "amplify_logs_to_firehose" {
  name            = "${local.csi}-amplify-logs-to-firehose"
  log_group_name  = aws_cloudwatch_log_group.amplify.name
  filter_pattern  = ""
  destination_arn = "arn:aws:logs:${var.region}:${var.observability_account_id}:destination:nhs-notify-main-obs-firehose-logs"
  role_arn        = aws_iam_role.amplify_logs_to_firehose_role.arn
}
