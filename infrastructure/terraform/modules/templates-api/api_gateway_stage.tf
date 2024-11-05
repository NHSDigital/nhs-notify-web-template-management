resource "aws_api_gateway_stage" "main" {
  stage_name    = "templates"
  description   = "template-management API stage"
  rest_api_id   = aws_api_gateway_rest_api.main.id
  deployment_id = aws_api_gateway_deployment.main.id
}
