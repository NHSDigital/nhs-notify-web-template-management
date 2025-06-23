resource "aws_cognito_user_pool" "sandbox" {
  name = local.csi

  lambda_config {
    pre_token_generation_config {
      lambda_arn     = module.cognito_triggers.pre_token_generation_lambda_function_arn
      lambda_version = "V2_0"
    }
  }

  schema {
    name                = "sbx:client_id"
    attribute_data_type = "String"
    mutable             = true
    required            = false
    string_attribute_constraints {}
  }
}
