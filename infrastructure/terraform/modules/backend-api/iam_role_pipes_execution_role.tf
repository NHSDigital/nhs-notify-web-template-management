resource "aws_iam_role" "pipes_execution_role" {
  name               = "${local.csi}-pipes-execution-role"
  description        = "Execution role for EventBridge Pipes"
  assume_role_policy = data.aws_iam_policy_document.pipes_trust_policy.json
}

data "aws_iam_policy_document" "pipes_trust_policy" {
  statement {
    sid     = "PipesAssumeRole"
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["pipes.amazonaws.com"]
    }
  }
}
