resource "aws_lambda_event_source_mapping" "sqs" {
  count = var.sqs_event_source_mapping != null ? 1 : 0

  event_source_arn                   = var.sqs_event_source_mapping.sqs_queue_arn
  function_name                      = aws_lambda_function.main.arn
  batch_size                         = var.sqs_event_source_mapping.batch_size
  maximum_batching_window_in_seconds = var.sqs_event_source_mapping.maximum_batching_window_in_seconds
  function_response_types = [
    "ReportBatchItemFailures"
  ]

  dynamic "scaling_config" {
    for_each = var.sqs_event_source_mapping.scaling_config != null ? [var.sqs_event_source_mapping.scaling_config] : []

    content {
      maximum_concurrency = scaling_config.value.maximum_concurrency
    }
  }
}