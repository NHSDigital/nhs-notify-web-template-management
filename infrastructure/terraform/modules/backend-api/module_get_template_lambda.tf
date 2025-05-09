module "get_template_lambda" {
    source = "git::https://github.com/NHSDigital/nhs-notify-shared-modules.git//infrastructure/modules/lambda?ref=v2.0.2"

    project        = var.project
    environment    = var.environment
    component      = var.component
    aws_account_id = var.aws_account_id
    region         = var.region

    kms_key_arn = var.kms_key_arn

    function_name = "get-template"

    function_module_name  = "get"
    handler_function_name = "handler"
    description           = "Get template API endpoint"

    memory  = 512
    timeout = 20
    runtime = "nodejs20.x"

    log_retention_in_days = var.log_retention_in_days
    iam_policy_document = {
        body = data.aws_iam_policy_document.get_template_lambda_policy.json
    }

    lambda_env_vars         = local.backend_lambda_environment_variables
    function_s3_bucket      = var.function_s3_bucket
    function_code_base_path = ""
    function_code_dir       = "../../../../lambdas/backend-api/dist"
}

data "aws_iam_policy_document" "get_template_lambda_policy" {
  statement {
    sid    = "AllowDynamoAccess"
    effect = "Allow"

    actions = [
      "dynamodb:GetItem",
    ]

    resources = [
      aws_dynamodb_table.templates.arn,
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
