resource "aws_pipes_pipe" "tags_added" {
  name = "${local.csi}-tags-added"

  role_arn = aws_iam_role.pipe.arn

  source     = module.sqs_tags_added.sqs_queue_arn
  target     = var.target_event_bus_arn
  enrichment = module.lambda_get_object_tags.function_arn

  target_parameters {
    eventbridge_event_bus_parameters {
      detail_type = "object-tags-enriched"
      source      = var.output_event_source
      resources   = [var.source_bucket.arn]
    }
  }

  # unsupported apparently
  # kms_key_identifier = var.kms_key_arn

  # do we need this?
  log_configuration {
    include_execution_data = ["ALL"]
    level                  = "INFO"
    cloudwatch_logs_log_destination {
      log_group_arn = aws_cloudwatch_log_group.pipe.arn
    }
  }
}

resource "aws_cloudwatch_log_group" "pipe" {
  name              = "/aws/pipes/${local.csi}-tags-added"
  retention_in_days = var.log_retention_in_days
  kms_key_id        = var.kms_key_arn
}
