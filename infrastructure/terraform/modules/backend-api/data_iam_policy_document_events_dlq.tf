data "aws_iam_policy_document" "events_dlq" {
  statement {
    actions = ["sqs:SendMessage"]

    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }

    resources = ["*"]

    condition {
      test     = "StringLike"
      variable = "AWS:SourceArn"
      values = [
        "arn:aws:events:eu-west-2:891377170468:rule/*"
      ]
    }
  }
}
