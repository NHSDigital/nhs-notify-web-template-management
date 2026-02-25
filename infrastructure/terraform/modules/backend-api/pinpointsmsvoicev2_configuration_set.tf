resource "aws_cloudwatch_log_group" "smsvoice_events" {
  name              = "/aws/pinpoint/${local.csi}-sms"
  retention_in_days = var.log_retention_in_days
}

resource "aws_iam_role" "smsvoice" {
  name               = "${local.csi}-smsvoice"
  description        = "smsvoice role"
  assume_role_policy = data.aws_iam_policy_document.smsvoice_assumerole.json
}

resource "aws_iam_role_policy_attachment" "smsvoice_policy" {
  role       = aws_iam_role.smsvoice.name
  policy_arn = aws_iam_policy.smsvoice.arn
}

resource "aws_iam_policy" "smsvoice" {
  name        = "${local.csi}-smsvoice"
  description = "smsvoice policy"
  policy      = data.aws_iam_policy_document.smsvoice.json
}

data "aws_iam_policy_document" "smsvoice_assumerole" {
  statement {
    sid    = "SmsVoiceAssumeRole"
    effect = "Allow"

    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type = "Service"

      identifiers = [
        "sms-voice.amazonaws.com"
      ]
    }
  }
}

#tfsec:ignore:aws-iam-no-policy-wildcards
data "aws_iam_policy_document" "smsvoice" {
  statement {
    sid    = "AllowLogs"
    effect = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DescribeLogStreams"
    ]
    resources = [
      aws_cloudwatch_log_group.smsvoice_events.arn,
      "${aws_cloudwatch_log_group.smsvoice_events.arn}:*"
    ]
  }
}
