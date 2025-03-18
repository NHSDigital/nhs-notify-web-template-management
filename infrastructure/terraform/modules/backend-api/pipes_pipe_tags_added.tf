resource "aws_pipes_pipe" "tags_added" {
  name = "${local.csi}-tags-added"

  role_arn = aws_iam_role.pipe.arn

  source     = module.sqs_tags_added.sqs_queue_arn
  target     = data.aws_cloudwatch_event_bus.default.arn
  enrichment = module.lambda_get_s3_object_tags.function_arn

  target_parameters {
    eventbridge_event_bus_parameters {
      detail_type = "object-tags-enriched"
      source      = "templates.${var.environment}.${var.project}"
      resources   = [module.s3bucket_quarantine.arn]
    }
  }
}

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

    # condition {
    #   test     = "StringEquals"
    #   variable = "aws:SourceArn"
    #   values   = [aws_pipes_pipe.tags_added.arn]
    # }
  }
}

data "aws_iam_policy_document" "pipe" {
  version = "2012-10-17"

  statement {
    sid    = "AllowSqsSource"
    effect = "Allow"
    actions = [
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
    ]
    resources = [module.sqs_tags_added.sqs_queue_arn]
  }

  statement {
    sid       = "AllowLambdaEnrich"
    effect    = "Allow"
    actions   = ["lambda:InvokeFunction"]
    resources = [module.lambda_get_s3_object_tags.function_arn]
  }

  statement {
    sid     = "AllowEventBusTarget"
    effect  = "Allow"
    actions = ["events:PutEvent"]
    resources = [
      data.aws_cloudwatch_event_bus.default.arn
    ]
  }
}
