output "api_invoke_url" {
  value = "${aws_api_gateway_rest_api.main.id}.execute-api.eu-west-2.amazonaws.com"
}
