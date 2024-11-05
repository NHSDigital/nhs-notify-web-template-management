resource "aws_api_gateway_rest_api" "main" {
  name                         = "${var.csi}-templates"
  body                         = local.openapi_spec
  description                  = "template-management API"
  disable_execute_api_endpoint = false
}
