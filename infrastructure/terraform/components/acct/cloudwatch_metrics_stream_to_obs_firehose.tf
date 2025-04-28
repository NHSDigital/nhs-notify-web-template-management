resource "aws_cloudwatch_metric_stream" "metrics_to_obs_firehose" {
  name           = "metrics-to-obs-firehose"
  role_arn       = aws_iam_role.metrics_to_obs_firehose_role.arn
  firehose_arn   = "arn:aws:firehose:${var.region}:${var.observability_account_id}:deliverystream/nhs-notify-main-obs-splunk-metrics-firehose"
  output_format  = "json"
}

resource "aws_iam_role" "metrics_to_obs_firehose_role" {
  name               = "metric-stream-to-firehose-role"
  assume_role_policy = data.aws_iam_policy_document.metric_stream_assume_role_policy.json
}

data "aws_iam_policy_document" "metric_stream_assume_role_policy" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["streams.metrics.cloudwatch.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_policy" "metrics_to_obs_firehose_policy" {
  name        = "metric-stream-to-firehose-policy"
  description = "Policy to allow CloudWatch Metric Stream to send data to Firehose"

  policy = data.aws_iam_policy_document.metric_stream_firehose_policy.json
}

data "aws_iam_policy_document" "metric_stream_firehose_policy" {
  statement {
    effect = "Allow"

    actions = [
      "firehose:PutRecord",
      "firehose:PutRecordBatch"
    ]

    resources = [
      "arn:aws:firehose:${var.region}:${var.observability_account_id}:deliverystream/nhs-notify-main-obs-splunk-metrics-firehose"
    ]
  }
}

resource "aws_iam_role_policy_attachment" "metric_stream_to_firehose_attachment" {
  role       = aws_iam_role.metrics_to_obs_firehose_role.name
  policy_arn = aws_iam_policy.metrics_to_obs_firehose_policy.arn
}
