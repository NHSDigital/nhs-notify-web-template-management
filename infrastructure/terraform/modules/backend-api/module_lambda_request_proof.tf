module "request_proof_lambda" {
  depends_on = [module.build_template_lambda, module.build_template_client]

  source      = "../lambda-function"
  description = "Request a proof"

  function_name    = "${local.csi}-request-proof"
  filename         = module.build_template_lambda.zips[local.backend_lambda_entrypoints.request_proof].path
  source_code_hash = module.build_template_lambda.zips[local.backend_lambda_entrypoints.request_proof].base64sha256
  runtime          = "nodejs20.x"
  handler          = "proof.handler"

  log_retention_in_days = var.log_retention_in_days

  environment_variables = local.backend_lambda_environment_variables

  execution_role_policy_document = data.aws_iam_policy_document.request_proof_lambda_policy.json
}

data "aws_iam_policy_document" "request_proof_lambda_policy" {
  statement {
    sid    = "AllowDynamoAccess"
    effect = "Allow"

    actions = [
      "dynamodb:UpdateItem",
    ]

    resources = [
      aws_dynamodb_table.templates.arn,
    ]
  }

  statement {
    sid    = "AllowProofingSQS"
    effect = "Allow"

    actions = [
      "sqs:SendMessage",
    ]

    resources = [
      module.sqs_sftp_upload.sqs_queue_arn,
    ]
  }

  statement {
    sid    = "AllowKMSAccess"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
      "kms:DescribeKey",
      "kms:Encrypt",
      "kms:GenerateDataKey*",
      "kms:ReEncrypt*",
    ]

    resources = [
      local.dynamodb_kms_key_arn
    ]
  }
}
