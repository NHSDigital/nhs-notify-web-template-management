Feature: Tag Compliance

  Scenario: Ensure all resources have tags
    Given I have resource that supports tags_all defined
    Then it must contain tags_all
    And its value must not be null
