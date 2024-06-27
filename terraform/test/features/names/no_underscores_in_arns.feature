Feature: Compliance With Naming Standards
  Ensure everything has appropriate names as per CONTRIBUTING.md

  @exclude_.*api_gateway_execution.*
  @exclude_.*aws_glue_catalog_table.*
  @exclude_.*awscc_backup.*
  @exclude_.*aws_backup_report_plan.*
  @exclude_module.ssm_parameters_placeholders.aws_ssm_parameter.group\[\".*govuknotify.*\"\]
  @exclude_module.client_subscriptions_status.aws_s3_object.*
  Scenario: Ensure all AWS ARNs don't contain underscores
    Given I have resource that supports arn defined
    When it has arn
    When its arn is "^arn:.*" regex
    Then it must have arn
    And its value must not match the "arn:(.*)_(.*)" regex
