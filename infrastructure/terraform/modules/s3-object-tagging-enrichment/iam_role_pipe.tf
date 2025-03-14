resource "aws_iam_role" "pipe" {
  name               = "${local.csi}-pipe"
  description        = "Role used by Pipes enrich S3 tagging events"
  assume_role_policy = data.aws_iam_policy_document.pipe_trust_policy.json
}

resource "aws_iam_role_policy" "pipe" {
  role   = aws_iam_role.pipe.id
  policy = data.aws_iam_policy_document.pipe.json
}

data "aws_iam_policy_document" "pipe_trust_policy" {
  version = "2012-10-17"

  statement {
    sid     = "PipesAssumeRole"
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type = "Service"

      identifiers = ["pipes.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = [var.aws_account_id]
    }

    condition {
      test     = "StringEquals"
      variable = "aws:SourceArn"
      values   = [aws_pipes_pipe.tags_added.arn]
    }
  }
}

data "aws_iam_policy_document" "pipe" {
  version = "2012-10-17"
  statement {
    sid    = "AllowLogs"
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = [
      aws_cloudwatch_log_group.pipe.arn,
      "${aws_cloudwatch_log_group.pipe.arn}:*"
    ]
  }

  statement {
    sid    = "AllowSqsSource"
    effect = "Allow"
    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
    ]
    resources = [aws_sqs_queue.tags_added.arn]
  }

  statement {
    sid       = "AllowLambdaEnrich"
    effect    = "Allow"
    actions   = ["lambda:InvokeFunction"]
    resources = [module.lambda_get_object_tags.function_arn]
  }

  statement {
    sid     = "AllowEventBusTarget"
    effect  = "Allow"
    actions = ["events:PutEvent"]
    resources = [
      var.target_event_bus_arn
    ]
  }
}
