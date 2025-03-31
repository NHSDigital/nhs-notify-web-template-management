resource "aws_api_gateway_rest_api" "main" {
  name                         = local.csi
  body                         = local.openapi_spec
  description                  = "Templates API"
  disable_execute_api_endpoint = false

  binary_media_types = [ "multipart/form-data" ]
}
