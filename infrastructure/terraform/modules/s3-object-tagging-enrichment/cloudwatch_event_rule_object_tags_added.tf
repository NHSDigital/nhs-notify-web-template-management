resource "aws_cloudwatch_event_rule" "tags_added" {
  name        = "${local.csi}-tags-added"
  description = "Forwards 'Object Tags Added' s3 events for enrichment"

  event_pattern = jsonencode({
    source     = ["aws.s3"]
    detailType = ["Object Tags Added"]
    detail = {
      bucket = {
        name = [var.source_bucket.name]
      }
    }
  })
}

resource "aws_cloudwatch_event_target" "tags_added" {
  rule = aws_cloudwatch_event_rule.tags_added.name
  arn  = module.sqs_tags_added.sqs_queue_arn
}
