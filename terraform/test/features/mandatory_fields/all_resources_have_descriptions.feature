Feature: Mandatory Fields
  Ensure mandatory fields for all resources are populated

  @exclude_.*aws_securityhub_standards_control.*
  @exclude_.*aws_securityhub_insight.*
  @exclude_.*aws_default_security_group.*
  @exclude_.*local_file.*
  Scenario: Ensure all resources have descriptions
    Given I have resource that supports description defined
    Then it must contain description
    And its value must not be null
