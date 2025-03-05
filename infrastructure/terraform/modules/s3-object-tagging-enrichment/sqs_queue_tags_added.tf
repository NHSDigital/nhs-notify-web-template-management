resource "aws_sqs_queue" "tags_added" {
  name              = "${local.csi}-tags-added"
  kms_master_key_id = var.kms_key_arn
}

resource "aws_sqs_queue_policy" "tags_added" {
  queue_url = aws_sqs_queue.tags_added.url
  policy    = data.aws_iam_policy_document.sqs_tags_added.json
}

data "aws_iam_policy_document" "sqs_tags_added" {
  version = "2012-10-17"

  statement {
    effect  = "Allow"
    actions = ["SQS:SendMessage"]

    principals {
      type        = "Service"
      identifiers = ["events.amazonaws.com"]
    }

    resources = [aws_sqs_queue.tags_added.arn]
  }
}
