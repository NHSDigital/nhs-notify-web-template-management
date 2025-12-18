resource "aws_cognito_user_pool" "sandbox" {
  name = local.csi

  lambda_config {
    pre_token_generation_config {
      lambda_arn     = module.cognito_triggers.pre_token_generation_lambda_function_arn
      lambda_version = "V2_0"
    }

    pre_authentication = module.cognito_triggers.pre_authentication_lambda_function_arn
  }

  schema {
    name                = "sbx_client_id"
    attribute_data_type = "String"
    mutable             = true
    required            = false
    string_attribute_constraints {}
  }

  schema {
    name                = "sbx_client_name"
    attribute_data_type = "String"
    mutable             = true
    required            = false
    string_attribute_constraints {}
  }

  schema {
    name                = "nhs_notify_user_id"
    attribute_data_type = "String"
    mutable             = true
    required            = false
    string_attribute_constraints {}
  }
}
