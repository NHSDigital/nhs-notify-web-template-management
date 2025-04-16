resource "aws_cloudwatch_event_rule" "sftp_poll" {
  name                = "${local.csi}-sftp-poll"
  schedule_expression = "rate(1 hour)" # Runs at the top of every hour
}

resource "aws_cloudwatch_event_target" "sftp_poll" {
  rule = aws_cloudwatch_event_rule.sftp_poll.name
  arn  = module.lambda_sftp_poll.function_arn
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda_sftp_poll.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.sftp_poll.arn
}
