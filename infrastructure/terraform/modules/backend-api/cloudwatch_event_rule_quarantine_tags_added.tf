resource "aws_cloudwatch_event_rule" "quarantine_tags_added" {
  name        = "${local.csi}-quarantine-tags-added"
  description = "Forwards 'Object Tags Added' quarantine s3 events for enrichment"

  event_pattern = jsonencode({
    source      = ["aws.s3"]
    detail-type = ["Object Tags Added"]
    detail = {
      bucket = {
        name = [module.s3bucket_quarantine.id]
      }
    }
  })
}

resource "aws_cloudwatch_event_target" "quarantine_tags_added_to_sqs" {
  rule     = aws_cloudwatch_event_rule.quarantine_tags_added.name
  arn      = module.sqs_quarantine_tags_added.sqs_queue_arn
  role_arn = aws_iam_role.quarantine_tags_added_to_sqs.arn
}

resource "aws_iam_role" "quarantine_tags_added_to_sqs" {
  name               = "${local.csi}-quarantine-tags-added-to-sqs"
  assume_role_policy = data.aws_iam_policy_document.events_assume_role.json
}

resource "aws_iam_role_policy" "quarantine_tags_added_to_sqs" {
  name   = "${local.csi}-quarantine-tags-added-to-sqs"
  role   = aws_iam_role.quarantine_tags_added_to_sqs.id
  policy = data.aws_iam_policy_document.quarantine_tags_added_to_sqs.json
}

data "aws_iam_policy_document" "quarantine_tags_added_to_sqs" {
  version = "2012-10-17"

  statement {
    sid       = "AllowSQSSendMessage"
    effect    = "Allow"
    actions   = ["sqs:SendMessage"]
    resources = [module.sqs_quarantine_tags_added.sqs_queue_arn]
  }

  statement {
    sid    = "AllowKMS"
    effect = "Allow"
    actions = [
      "kms:Decrypt",
      "kms:GenerateDataKey"
    ]
    resources = [var.kms_key_arn]
  }
}
