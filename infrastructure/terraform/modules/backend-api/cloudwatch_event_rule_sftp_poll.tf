resource "aws_cloudwatch_event_rule" "sftp_poll" {
  for_each = var.letter_suppliers

  name                = "${local.csi}-sftp-poll-${lower(each.key)}"
  schedule_expression = "rate(1 hour)" # Runs at the top of every hour

  state = each.value.polling_enabled ? "ENABLED" : "DISABLED"
}

resource "aws_cloudwatch_event_target" "sftp_poll" {
  for_each = var.letter_suppliers
  rule     = aws_cloudwatch_event_rule.sftp_poll[each.key].name
  arn      = module.lambda_sftp_poll.function_arn

  input = jsonencode({
    supplier : each.key
  })
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  for_each      = var.letter_suppliers
  statement_id  = "AllowExecutionFromCloudWatch${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = module.lambda_sftp_poll.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.sftp_poll[each.key].arn
}
