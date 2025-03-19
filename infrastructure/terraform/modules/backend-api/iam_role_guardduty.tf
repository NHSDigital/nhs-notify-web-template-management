resource "aws_iam_role" "guardduty" {
  name               = "${local.csi}-guardduty"
  description        = "IAM Role for GuardDuty to provide S3 malware protection"
  assume_role_policy = data.aws_iam_policy_document.guardduty_assumerole.json
}

resource "aws_iam_role_policy_attachment" "guardduty" {
  role       = aws_iam_role.guardduty.name
  policy_arn = aws_iam_policy.guardduty.arn
}

resource "aws_iam_policy" "guardduty" {
  name        = "${local.csi}-guardduty"
  description = "Permissions for GuardDuty to provide S3 malware protection"
  policy      = data.aws_iam_policy_document.guardduty.json
}

data "aws_iam_policy_document" "guardduty_assumerole" {
  statement {
    sid    = "GuardDutyAssumeRole"
    effect = "Allow"

    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type = "Service"

      identifiers = [
        "malware-protection-plan.guardduty.amazonaws.com"
      ]
    }
  }
}

data "aws_iam_policy_document" "guardduty" {
  statement {
    sid    = "AllowManagedRuleToSendS3EventsToGuardDuty"
    effect = "Allow"
    actions = [
      "events:PutRule",
      "events:DeleteRule",
      "events:PutTargets",
      "events:RemoveTargets"
    ]
    resources = [
      "arn:aws:events:${var.region}:${var.aws_account_id}:rule/DO-NOT-DELETE-AmazonGuardDutyMalwareProtectionS3*"
    ]
    condition {
      test     = "StringLike"
      variable = "events:ManagedBy"
      values = [
        "malware-protection-plan.guardduty.amazonaws.com"
      ]
    }
  }

  statement {
    sid    = "AllowGuardDutyToMonitorEventBridgeManagedRule"
    effect = "Allow"
    actions = [
      "events:DescribeRule",
      "events:ListTargetsByRule"
    ]
    resources = [
      "arn:aws:events:${var.region}:${var.aws_account_id}:rule/DO-NOT-DELETE-AmazonGuardDutyMalwareProtectionS3*"
    ]
  }

  statement {
    sid    = "AllowPostScanTag"
    effect = "Allow"
    actions = [
      "S3:PutObjectTagging",
      "S3:GetObjectTagging",
      "S3:PutObjectVersionTagging",
      "S3:GetObjectVersionTagging"
    ]

    resources = [
      "${module.s3bucket_quarantine.arn}/*"
    ]
  }

  statement {
    sid    = "AllowEnableS3EventBridgeEvents"
    effect = "Allow"
    actions = [
      "s3:PutBucketNotification",
      "s3:GetBucketNotification"
    ]
    resources = [
      module.s3bucket_quarantine.arn
    ]
  }

  statement {
    sid    = "AllowPutValidationObject"
    effect = "Allow"
    actions = [
      "s3:PutObject"
    ]
    resources = [
      "${module.s3bucket_quarantine.arn}/malware-protection-resource-validation-object"
    ]
  }

  statement {
    sid    = "AllowCheckBucketOwnership"
    effect = "Allow"
    actions = [
      "s3:ListBucket"
    ]
    resources = [
      module.s3bucket_quarantine.arn
    ]
  }
  statement {
    sid    = "AllowMalwareScan"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:GetObjectVersion"
    ]

    resources = [
      "${module.s3bucket_quarantine.arn}/*"
    ]
  }

  statement {
    sid    = "AllowKMSDecrypt"
    effect = "Allow"
    actions = [
      "kms:GenerateDataKey",
      "kms:Decrypt"
    ]
    resources = [
      var.kms_key_arn
    ]
    condition {
      test     = "StringLike"
      variable = "kms:ViaService"
      values = [
        "s3.*.amazonaws.com"
      ]
    }
  }
}
