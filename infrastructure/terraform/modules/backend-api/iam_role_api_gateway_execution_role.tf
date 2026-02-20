resource "aws_iam_role" "api_gateway_execution_role" {
  name               = "${local.csi}-apig"
  description        = "Allows API Gateway service to invoke Lambda functions"
  assume_role_policy = data.aws_iam_policy_document.api_gateway_service_trust_policy.json
}

resource "aws_iam_role_policy_attachment" "cloudwatch_logs" {
  role       = aws_iam_role.api_gateway_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

resource "aws_iam_policy" "api_gateway_execution_policy" {
  name   = "${local.csi}-apig-execution-policy"
  policy = data.aws_iam_policy_document.api_gateway_execution_policy.json
}

resource "aws_iam_role_policy_attachment" "api_gateway_execution" {
  role       = aws_iam_role.api_gateway_execution_role.name
  policy_arn = aws_iam_policy.api_gateway_execution_policy.arn
}

data "aws_iam_policy_document" "api_gateway_service_trust_policy" {
  statement {
    sid    = "ApiGatewayAssumeRole"
    effect = "Allow"

    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type = "Service"

      identifiers = [
        "apigateway.amazonaws.com"
      ]
    }
  }
}

data "aws_iam_policy_document" "api_gateway_execution_policy" {
  statement {
    sid    = "AllowInvokeLambda"
    effect = "Allow"

    actions = [
      "lambda:InvokeFunction",
    ]

    resources = [
      module.authorizer_lambda.function_arn,
      module.upload_docx_letter_template_lambda.function_arn,
      module.upload_letter_template_lambda.function_arn,
      module.count_routing_configs_lambda.function_arn,
      module.create_template_lambda.function_arn,
      module.create_routing_config_lambda.function_arn,
      module.delete_routing_config_lambda.function_arn,
      module.delete_template_lambda.function_arn,
      module.get_client_lambda.function_arn,
      module.get_routing_config_lambda.function_arn,
      module.get_routing_configs_by_template_id_lambda.function_arn,
      module.get_template_lambda.function_arn,
      module.list_routing_configs_lambda.function_arn,
      module.list_template_lambda.function_arn,
      module.patch_template_lambda.function_arn,
      module.request_proof_lambda.function_arn,
      module.submit_template_lambda.function_arn,
      module.submit_routing_config_lambda.function_arn,
      module.update_routing_config_lambda.function_arn,
      module.update_template_lambda.function_arn,
    ]
  }
}
