resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  stage_name  = ""
  description = "templates API gateway deployment"

  triggers = {
    openapi_hash = sha1(jsonencode(local.openapi_spec)),
  }

  variables = {
    deployed_at = timestamp()
  }

  lifecycle {
    create_before_destroy = true
  }
}
